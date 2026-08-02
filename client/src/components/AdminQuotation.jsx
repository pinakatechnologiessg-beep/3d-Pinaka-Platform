import React, { useState, useMemo, useEffect } from 'react';
import { MagnifyingGlass, X, Plus, Trash, DownloadSimple } from '@phosphor-icons/react';
import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const parsePriceLocal = (p) => {
    if (typeof p === 'number') return p;
    return parseInt(String(p).replace(/[^0-9]/g, '')) || 0;
};

const AdminQuotation = ({ products }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [quotationList, setQuotationList] = useState(() => {
        const saved = localStorage.getItem('lastQuotationList');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });
    
    // Customer Info
    const [customerName, setCustomerName] = useState(() => localStorage.getItem('lastQuotationName') || '');
    const [customerCompany, setCustomerCompany] = useState(() => localStorage.getItem('lastQuotationCompany') || '');
    const [quotationDate, setQuotationDate] = useState(new Date().toISOString().split('T')[0]);
    const [validUntil, setValidUntil] = useState(() => localStorage.getItem('lastQuotationValidUntil') || '');
    const [customerAddress, setCustomerAddress] = useState(() => localStorage.getItem('lastQuotationAddress') || '');
    const [customerGst, setCustomerGst] = useState(() => localStorage.getItem('lastQuotationGst') || '');
    const [shippingCharges, setShippingCharges] = useState(() => Number(localStorage.getItem('lastQuotationShipping')) || 0);

    const [quotationHistory, setQuotationHistory] = useState(() => {
        const saved = localStorage.getItem('quotationHistory');
        if (saved) {
            try { return JSON.parse(saved); } catch (e) { return []; }
        }
        return [];
    });

    const [logoBase64, setLogoBase64] = useState(null);
    const [signatureBase64, setSignatureBase64] = useState(null);

    useEffect(() => {
        fetch('/footer-logo.png')
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => setLogoBase64(reader.result);
                reader.readAsDataURL(blob);
            })
            .catch(err => console.error("Error loading logo:", err));
            
        fetch('/signature.png')
            .then(res => res.blob())
            .then(blob => {
                const reader = new FileReader();
                reader.onloadend = () => setSignatureBase64(reader.result);
                reader.readAsDataURL(blob);
            })
            .catch(err => console.error("Error loading signature:", err));
    }, []);

    useEffect(() => {
        localStorage.setItem('lastQuotationList', JSON.stringify(quotationList));
        localStorage.setItem('lastQuotationName', customerName);
        localStorage.setItem('lastQuotationCompany', customerCompany);
        localStorage.setItem('lastQuotationValidUntil', validUntil);
        localStorage.setItem('lastQuotationAddress', customerAddress);
        localStorage.setItem('lastQuotationGst', customerGst);
        localStorage.setItem('lastQuotationShipping', shippingCharges);
    }, [quotationList, customerName, customerCompany, validUntil, customerAddress, customerGst, shippingCharges]);

    useEffect(() => {
        localStorage.setItem('quotationHistory', JSON.stringify(quotationHistory));
    }, [quotationHistory]);

    const handleLoadHistory = (record) => {
        if (window.confirm("This will overwrite your current quotation. Continue?")) {
            setCustomerName(record.customerName || '');
            setCustomerCompany(record.customerCompany || '');
            setQuotationDate(record.quotationDate || new Date().toISOString().split('T')[0]);
            setValidUntil(record.validUntil || '');
            setCustomerAddress(record.customerAddress || '');
            setCustomerGst(record.customerGst || '');
            setShippingCharges(record.shippingCharges || 0);
            setQuotationList(record.quotationList || []);
        }
    };

    const filteredProducts = useMemo(() => {
        if (!searchQuery) return [];
        return products.filter(p => 
            p.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [products, searchQuery]);

    const handleAddProduct = (product) => {
        if (quotationList.find(p => p._id === product._id)) return;
        setQuotationList([...quotationList, { ...product, quoteQuantity: 1, quotePrice: parsePriceLocal(product.price) }]);
        setSearchQuery('');
    };

    const handleRemoveProduct = (id) => {
        setQuotationList(quotationList.filter(p => p._id !== id));
    };

    const handleQuantityChange = (id, quantity) => {
        const val = Math.max(1, parseInt(quantity) || 1);
        setQuotationList(quotationList.map(p => p._id === id ? { ...p, quoteQuantity: val } : p));
    };

    const handlePriceChange = (id, price) => {
        const val = Math.max(0, parseInt(price) || 0);
        setQuotationList(quotationList.map(p => p._id === id ? { ...p, quotePrice: val } : p));
    };

    const baseTotal = quotationList.reduce((acc, curr) => acc + (curr.quoteQuantity * curr.quotePrice), 0);
    const grandTotal = baseTotal + (shippingCharges || 0);

    const formatINR = (num) => {
        return Number(num).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    };

    const createPDFDoc = (data) => {
        const { customerName, customerCompany, quotationDate, validUntil, quotationList, grandTotal, customerAddress, customerGst, quotationNo, shippingCharges } = data;
        const doc = new jsPDF();
        
        const marginX = 14;
        const width = 182; 
        
        // 1. Header Box
        doc.setFillColor(217, 234, 250); 
        doc.rect(marginX, 14, width, 12, 'FD'); 
        
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("QUOTATION", 105, 22, { align: 'center' });
        
        doc.setFontSize(8);
        doc.setFont("helvetica", "normal");
        const finalQuotationNo = quotationNo || `SE${Math.floor(100000 + Math.random() * 900000)}`;
        doc.text(`QUOTATION NO : ${finalQuotationNo}`, marginX + width - 4, 18, { align: 'right' });
        doc.text(`DATE : ${quotationDate}`, marginX + width - 4, 23, { align: 'right' });
        
        // 2. Company Info Box
        doc.rect(marginX, 26, width, 30);
        if (logoBase64) {
            doc.addImage(logoBase64, 'PNG', marginX + 4, 30, 45, 22);
        }
        doc.setFontSize(14);
        doc.setFont("helvetica", "bold");
        doc.text("PINAKA TECHNOLOGIES S G PVT LTD", 105, 34, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        doc.text("86 Sanjay Gandhi Nagar, Naubasta Kanpur 208021", 105, 40, { align: 'center' });
        doc.text("GSTIN: 09AALCP3503B1ZQ", 105, 46, { align: 'center' });
        doc.text("PAN NO. AALCP3503B", 105, 52, { align: 'center' });
        
        // 3. Customer Info Box
        const customerBoxY = 56;
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text(`${customerName || 'Customer Name'}`, marginX + 2, customerBoxY + 5);
        doc.setFont("helvetica", "normal");
        
        let currentY = customerBoxY + 10;
        
        if (customerCompany) {
            let companyLines = doc.splitTextToSize(customerCompany, width - 4);
            doc.text(companyLines, marginX + 2, currentY);
            currentY += companyLines.length * 4.5;
        }
        
        if (customerAddress) {
            let addrLines = doc.splitTextToSize(customerAddress, width - 4);
            doc.text(addrLines, marginX + 2, currentY);
            currentY += addrLines.length * 4.5;
        } else if (!customerCompany) {
            doc.text('Address Not Provided', marginX + 2, currentY);
            currentY += 4.5;
        }
        
        doc.text(`GSTIN: ${customerGst || ''}`, marginX + 2, currentY);
        currentY += 4.5;
        
        const customerBoxHeight = Math.max(25, currentY - customerBoxY + 1);
        doc.rect(marginX, customerBoxY, width, customerBoxHeight);
        
        // 4. Table using autoTable
        const tableColumn = ["Particulars (Descriptions & Specifications)", "Qty", "Rate", "Amount"];
        const tableRows = [];

        let calculatedTotal = 0;
        quotationList.forEach(product => {
            const baseRate = product.quotePrice / 1.18;
            const productTotal = baseRate * product.quoteQuantity;
            calculatedTotal += productTotal;
            tableRows.push([
                product.name,
                product.quoteQuantity.toString(),
                formatINR(baseRate),
                formatINR(productTotal)
            ]);
        });
        
        const maxFinalY = 297 - 10 - 101; // Page height (297) - margin (10) - summary and footer height (101)
        const availableTableHeight = maxFinalY - (customerBoxY + customerBoxHeight);
        const expectedRowHeight = 9.5; // safer estimate including padding
        const headerHeight = 10;
        
        let maxRowsThatFit = Math.floor((availableTableHeight - headerHeight) / expectedRowHeight);
        if (maxRowsThatFit < 1) maxRowsThatFit = 1;
        
        const totalRowsNeeded = Math.max(quotationList.length, maxRowsThatFit);
        const emptyRows = totalRowsNeeded - quotationList.length;
        
        for (let i = 0; i < emptyRows; i++) {
            tableRows.push(['', '', '', '']);
        }

        autoTable(doc, {
            startY: customerBoxY + customerBoxHeight,
            head: [tableColumn],
            body: tableRows,
            theme: 'grid',
            headStyles: { 
                fillColor: [255, 255, 255], 
                textColor: [0, 0, 0],
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                fontStyle: 'bold',
                halign: 'center'
            },
            bodyStyles: {
                lineWidth: 0.1,
                lineColor: [0, 0, 0],
                textColor: [0, 0, 0],
                minCellHeight: 6
            },
            columnStyles: {
                0: { halign: 'left' },
                1: { halign: 'right', cellWidth: 20 },
                2: { halign: 'right', cellWidth: 30 },
                3: { halign: 'right', cellWidth: 30 }
            },
            margin: { left: marginX, right: marginX },
            tableWidth: width,
        });

        let finalY = doc.lastAutoTable.finalY || 160;
        
        const summaryHeight = 65;
        const rightColWidth = 80;
        const leftColWidth = width - rightColWidth;

        if (finalY + summaryHeight + 36 > doc.internal.pageSize.height - 10) {
            doc.addPage();
            finalY = 14;
        }

        // 5. Bottom Section: Terms & Conditions and Totals
        doc.rect(marginX, finalY, width, summaryHeight);
        doc.line(marginX + leftColWidth, finalY, marginX + leftColWidth, finalY + summaryHeight);
        
        // Right side (Totals)
        const totalY = finalY;
        doc.line(marginX + leftColWidth, totalY + 11, marginX + width, totalY + 11);
        doc.line(marginX + leftColWidth, totalY + 22, marginX + width, totalY + 22);
        doc.line(marginX + leftColWidth, totalY + 33, marginX + width, totalY + 33);
        
        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.text("Total", marginX + leftColWidth + 2, totalY + 7);
        doc.text(formatINR(calculatedTotal), marginX + width - 2, totalY + 7, { align: 'right' });
        
        doc.text("Add : GST @ 18%", marginX + leftColWidth + 2, totalY + 18);
        const productsInclusiveTotal = data.quotationList.reduce((acc, curr) => acc + (curr.quoteQuantity * curr.quotePrice), 0);
        const gst = productsInclusiveTotal - calculatedTotal;
        doc.text(formatINR(gst), marginX + width - 2, totalY + 18, { align: 'right' });
        
        doc.text("Shipping Charges", marginX + leftColWidth + 2, totalY + 29);
        const shipping = data.shippingCharges || 0;
        doc.text(formatINR(shipping), marginX + width - 2, totalY + 29, { align: 'right' });
        
        const grandTotalY = totalY + summaryHeight - 15;
        doc.setFillColor(217, 234, 250);
        doc.rect(marginX + leftColWidth, grandTotalY, rightColWidth, 15, 'FD');
        
        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.text("Grand Total       (INR)", marginX + leftColWidth + 2, grandTotalY + 10);
        doc.text(formatINR(grandTotal), marginX + width - 2, grandTotalY + 10, { align: 'right' });
        
        // Terms and Conditions (Left side)
        doc.setFontSize(7);
        doc.setFont("helvetica", "bold");
        doc.text("Quotation Terms and Conditions", marginX + 2, totalY + 5);
        doc.setFontSize(6.5);
        
        const terms = [
            { text: "1. Quotation Validity", bold: true },
            { text: "This quotation is valid for 7 days from the date of issuance. Prices and terms are subject to change after this period.", bold: false },
            { text: "2. Delivery and Shipping", bold: true },
            { text: "Estimated delivery time is [2-4] weeks from the date of receipt of the order and payment.\nShipping costs are excluded ,The seller is not responsible for any delays caused by shipping companies or customs.", bold: false },
            { text: "3. Installation and Training", bold: true },
            { text: "Installation and initial setup are Excluded .\nOn-site training for operating the 3D printer is excluded and can be provided at an additional cost.", bold: false },
            { text: "4. Technical Support", bold: true },
            { text: "Technical support is available via phone or email during regular business hours.\nExtended support plans are available for an additional fee.", bold: false },
            { text: "5. Returns and Refunds:-Goods once sold will not be taken back", bold: true },
            { text: "6. Liability:-The seller's liability is limited to the purchase price of the 3D printer.", bold: true },
            { text: "The seller is not liable for any consequential damages or losses arising from the use or inability to use the 3D printer.", bold: false },
            { text: "7. Governing Law", bold: true },
            { text: "This agreement shall be governed by and construed in accordance with the laws of Kanpur Jurisdiction.", bold: false }
        ];
        
        let termY = totalY + 9;
        terms.forEach(term => {
            doc.setFont("helvetica", term.bold ? "bold" : "normal");
            const lines = doc.splitTextToSize(term.text, leftColWidth - 4);
            doc.text(lines, marginX + 2, termY);
            termY += lines.length * 2.8;
        });
        
        const bottomSectionY = finalY + summaryHeight;
        
        // Name -> PINAKA TECHNOLOGIES...
        doc.rect(marginX, bottomSectionY, width, 6);
        doc.setFontSize(9);
        doc.setFont("helvetica", "bold");
        doc.text("Name :- PINAKA TECHNOLOGIES S G PRIVATE LIMITED", 105, bottomSectionY + 4.5, { align: 'center' });
        
        // Bank Details
        doc.rect(marginX, bottomSectionY + 6, width, 6);
        doc.text("Bank Details: Acc no 50200062168409   IFSC Code : HDFC0009347", 105, bottomSectionY + 10.5, { align: 'center' });
        
        // Signature area
        doc.rect(marginX, bottomSectionY + 12, width, 24);
        doc.setFontSize(8);
        doc.setFont("helvetica", "italic");
        doc.text("For PINAKA TECHNOLOGIES S G PVT LTD", marginX + 2, bottomSectionY + 17);
        
        if (signatureBase64) {
            doc.addImage(signatureBase64, 'PNG', marginX + 20, bottomSectionY + 18, 28, 12);
        }
        
        doc.setFont("helvetica", "bold");
        doc.setFontSize(9);
        doc.text("Authorised Signatory", marginX + 34, bottomSectionY + 34, { align: 'center' });

        return doc;
    };

    const generatePDF = () => {
        const quotationNo = `SE${Math.floor(100000 + Math.random() * 900000)}`;
        const doc = createPDFDoc({ customerName, customerCompany, quotationDate, validUntil, quotationList, grandTotal, customerAddress, customerGst, quotationNo, shippingCharges });
        doc.save(`Quotation_${quotationNo}.pdf`);

        // Save to History
        const newRecord = {
            id: Date.now(),
            quotationNo,
            customerName,
            customerCompany,
            quotationDate,
            validUntil,
            customerAddress,
            customerGst,
            shippingCharges,
            quotationList,
            grandTotal,
            timestamp: new Date().toISOString()
        };
        setQuotationHistory(prev => [newRecord, ...prev]);
    };

    const handleDownloadHistory = (record) => {
        const doc = createPDFDoc(record);
        doc.save(`Quotation_${record.quotationNo || new Date(record.timestamp).getTime()}.pdf`);
    };

    return (
        <div className="dashboard-content" style={{ padding: '24px' }}>
            <div className="products-mgmt-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
                <h2 className="products-mgmt-title" style={{ fontSize: '1.5rem', color: 'var(--admin-text-dark)', margin: 0 }}>Generate Quotation</h2>
                <button 
                    onClick={generatePDF}
                    disabled={quotationList.length === 0}
                    style={{ 
                        display: 'flex', alignItems: 'center', gap: '8px', 
                        padding: '10px 20px', borderRadius: '8px', 
                        background: quotationList.length > 0 ? 'var(--primary)' : '#cbd5e1', 
                        color: 'white', border: 'none', fontWeight: 600, 
                        cursor: quotationList.length > 0 ? 'pointer' : 'not-allowed' 
                    }}
                >
                    <DownloadSimple size={20} weight="bold" />
                    Download PDF
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
                {/* Customer Details Form */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--admin-border-color)' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: 'var(--admin-text-main)' }}>Customer Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Customer Name</label>
                            <input 
                                type="text" 
                                value={customerName} 
                                onChange={(e) => setCustomerName(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                                placeholder="e.g. John Doe"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Company</label>
                            <input 
                                type="text" 
                                value={customerCompany} 
                                onChange={(e) => setCustomerCompany(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                                placeholder="e.g. Tech Corp"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Date</label>
                            <input 
                                type="date" 
                                value={quotationDate} 
                                onChange={(e) => setQuotationDate(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Valid Until</label>
                            <input 
                                type="date" 
                                value={validUntil} 
                                onChange={(e) => setValidUntil(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Address</label>
                            <input 
                                type="text" 
                                value={customerAddress} 
                                onChange={(e) => setCustomerAddress(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                                placeholder="e.g. 123 Tech Street, City"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>GST Number</label>
                            <input 
                                type="text" 
                                value={customerGst} 
                                onChange={(e) => setCustomerGst(e.target.value)}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                                placeholder="e.g. 29GGGGG1314R9Z6"
                            />
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', color: '#64748b', marginBottom: '5px' }}>Shipping Charges (Rs)</label>
                            <input 
                                type="number" 
                                min="0"
                                value={shippingCharges === 0 ? '' : shippingCharges} 
                                onChange={(e) => setShippingCharges(e.target.value === '' ? 0 : Number(e.target.value))}
                                style={{ width: '100%', padding: '10px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}
                                placeholder="e.g. 500"
                            />
                        </div>
                    </div>
                </div>

                {/* Product Search */}
                <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid var(--admin-border-color)', position: 'relative' }}>
                    <h3 style={{ fontSize: '1.1rem', margin: '0 0 15px 0', color: 'var(--admin-text-main)' }}>Add Products</h3>
                    <div className="search-bar-wrapper" style={{ display: 'flex', alignItems: 'center', background: '#f8fafc', padding: '10px 15px', borderRadius: '8px', border: '1px solid var(--admin-border-color)' }}>
                        <MagnifyingGlass size={20} style={{ color: '#94a3b8', marginRight: '10px' }} />
                        <input 
                            type="text" 
                            placeholder="Search by product name..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            style={{ border: 'none', outline: 'none', width: '100%', fontSize: '0.95rem', background: 'transparent' }} 
                        />
                        {searchQuery && <X size={18} style={{ color: '#94a3b8', cursor: 'pointer' }} onClick={() => setSearchQuery('')} />}
                    </div>
                    
                    {searchQuery && (
                        <div style={{ position: 'absolute', top: '90px', left: '20px', right: '20px', background: 'white', border: '1px solid var(--admin-border-color)', borderRadius: '8px', maxHeight: '200px', overflowY: 'auto', zIndex: 10, boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                            {filteredProducts.length === 0 ? (
                                <div style={{ padding: '15px', textAlign: 'center', color: '#64748b' }}>No products found</div>
                            ) : (
                                filteredProducts.map(p => (
                                    <div key={p._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 15px', borderBottom: '1px solid #f1f5f9' }}>
                                        <div>
                                            <div style={{ fontWeight: 600, color: '#334155' }}>{p.name}</div>
                                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Rs. {parsePriceLocal(p.price)}</div>
                                        </div>
                                        <button 
                                            onClick={() => handleAddProduct(p)}
                                            style={{ padding: '6px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', border: 'none', cursor: 'pointer' }}
                                        >
                                            <Plus size={16} weight="bold" />
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Quotation List */}
            <div style={{ background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-color)', overflow: 'hidden' }}>
                <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid var(--admin-border-color)', fontWeight: 600, color: '#334155' }}>
                    Quotation Items
                </div>
                {quotationList.length === 0 ? (
                    <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>
                        No items added to the quotation yet.
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--admin-border-color)', color: '#64748b', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '15px 20px', fontWeight: 500 }}>Product Name</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500, width: '150px' }}>Quantity</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500, width: '150px' }}>Unit Price (Rs)</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500, width: '150px' }}>Total (Rs)</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500, width: '80px', textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotationList.map(item => (
                                    <tr key={item._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px 20px' }}>
                                            <div style={{ fontWeight: 600, color: '#334155' }}>{item.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{item.category}</div>
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <input 
                                                type="number" 
                                                min="1" 
                                                value={item.quoteQuantity} 
                                                onChange={(e) => handleQuantityChange(item._id, e.target.value)}
                                                style={{ width: '80px', padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}
                                            />
                                        </td>
                                        <td style={{ padding: '15px 20px' }}>
                                            <input 
                                                type="number" 
                                                min="0" 
                                                value={item.quotePrice} 
                                                onChange={(e) => handlePriceChange(item._id, e.target.value)}
                                                style={{ width: '100px', padding: '8px', borderRadius: '6px', border: '1px solid var(--admin-border-color)' }}
                                            />
                                        </td>
                                        <td style={{ padding: '15px 20px', fontWeight: 600, color: '#334155' }}>
                                            {item.quoteQuantity * item.quotePrice}
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleRemoveProduct(item._id)}
                                                style={{ padding: '8px', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer' }}
                                                title="Remove Item"
                                            >
                                                <Trash size={18} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
                {quotationList.length > 0 && (
                    <div style={{ padding: '20px', borderTop: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'flex-end' }}>
                        <div style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--text-dark)' }}>
                            Grand Total: <span style={{ color: 'var(--primary)', marginLeft: '10px' }}>Rs. {grandTotal}</span>
                        </div>
                    </div>
                )}
            </div>

            {/* Quotation History */}
            {quotationHistory.length > 0 && (
                <div style={{ marginTop: '30px', background: 'white', borderRadius: '12px', border: '1px solid var(--admin-border-color)', overflow: 'hidden' }}>
                    <div style={{ padding: '15px 20px', background: '#f8fafc', borderBottom: '1px solid var(--admin-border-color)', fontWeight: 600, color: '#334155' }}>
                        Previously Generated Quotations
                    </div>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid var(--admin-border-color)', color: '#64748b', fontSize: '0.9rem' }}>
                                    <th style={{ padding: '15px 20px', fontWeight: 500 }}>Generated On</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500 }}>Quotation No</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500 }}>Customer</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500 }}>Company</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500 }}>Total (Rs)</th>
                                    <th style={{ padding: '15px 20px', fontWeight: 500, textAlign: 'center' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {quotationHistory.map(record => (
                                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                        <td style={{ padding: '15px 20px', color: '#64748b' }}>
                                            {new Date(record.timestamp).toLocaleString()}
                                        </td>
                                        <td style={{ padding: '15px 20px', fontWeight: 600, color: 'var(--primary)' }}>
                                            {record.quotationNo || 'N/A'}
                                        </td>
                                        <td style={{ padding: '15px 20px', fontWeight: 600, color: '#334155' }}>
                                            {record.customerName || 'N/A'}
                                        </td>
                                        <td style={{ padding: '15px 20px', color: '#64748b' }}>
                                            {record.customerCompany || 'N/A'}
                                        </td>
                                        <td style={{ padding: '15px 20px', fontWeight: 600, color: '#334155' }}>
                                            {record.grandTotal}
                                        </td>
                                        <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                                            <button 
                                                onClick={() => handleDownloadHistory(record)}
                                                style={{ padding: '6px 12px', borderRadius: '6px', background: '#dcfce7', color: '#16a34a', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem', fontWeight: 500 }}
                                            >
                                                Download
                                            </button>
                                            <button 
                                                onClick={() => handleLoadHistory(record)}
                                                style={{ padding: '6px 12px', borderRadius: '6px', background: '#e0f2fe', color: '#0284c7', border: 'none', cursor: 'pointer', marginRight: '8px', fontSize: '0.85rem', fontWeight: 500 }}
                                            >
                                                Load
                                            </button>
                                            <button 
                                                onClick={() => setQuotationHistory(prev => prev.filter(h => h.id !== record.id))}
                                                style={{ padding: '6px 12px', borderRadius: '6px', background: '#fef2f2', color: '#ef4444', border: 'none', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 500 }}
                                            >
                                                Delete
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminQuotation;
