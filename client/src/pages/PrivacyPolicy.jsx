import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, WhatsappLogo } from '@phosphor-icons/react';

const PrivacyPolicy = () => {
    const revealRefs = useRef([]);

    useEffect(() => {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('active');
                }
            });
        }, { threshold: 0.1 });

        revealRefs.current.forEach(el => el && observer.observe(el));
        return () => observer.disconnect();
    }, []);

    const addToRevealRefs = (el) => {
        if (el && !revealRefs.current.includes(el)) {
            revealRefs.current.push(el);
        }
    };

    return (
        <main>
            {/* Header Section */}
            <div style={{ background: 'var(--dark-bg)', padding: '5rem 0', color: 'white', textAlign: 'center' }}>
                <div className="container">
                    <div style={{ position: 'relative', display: 'inline-block' }}>
                        <Link to="/" className="back-home-btn" style={{ position: 'absolute', top: '-60px', left: '0' }}>
                            <ArrowLeft /> Back to Home
                        </Link>
                        <h1 style={{ fontSize: '3rem', fontWeight: 800 }}>Privacy Policy</h1>
                        <p style={{ opacity: 0.8, fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto' }}>
                            Your privacy is important to us. Learn how we collect and use your data.
                        </p>
                    </div>
                </div>
            </div>

            {/* Content Section */}
            <section className="section container reveal" ref={addToRevealRefs} style={{ background: 'white', padding: '3rem', borderRadius: '15px', border: '1px solid var(--border-color)', margin: '2rem auto', maxWidth: '1000px', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                <div style={{ color: 'var(--text-dark)', lineHeight: '1.8' }}>
                    <h2 style={{ fontSize: '1.8rem', color: 'var(--primary)', marginBottom: '1.5rem' }}>Privacy Policy for Pinaka Ttechnologies</h2>

                    <p>At 3dpinaka.in, accessible from <a href="https://3dpinaka.in/" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>https://3dpinaka.in/</a>, one of our main priorities is the privacy of our visitors. This Privacy Policy document contains types of information that is collected and recorded by 3dpinaka.in and how we use it.</p>

                    <p>If you have additional questions or require more information about our Privacy Policy, do not hesitate to contact us.</p>

                    <p>This Privacy Policy applies only to our online activities and is valid for visitors to our website with regards to the information that they shared and/or collect in 3dpinaka.in. This policy is not applicable to any information collected offline or via channels other than this website.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Consent</h3>
                    <p>By using our website, you hereby consent to our Privacy Policy and agree to its terms.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Information we collect</h3>
                    <p>The personal information that you are asked to provide, and the reasons why you are asked to provide it, will be made clear to you at the point we ask you to provide your personal information.</p>

                    <p>If you contact us directly, we may receive additional information about you such as your name, email address, phone number, the contents of the message and/or attachments you may send us, and any other information you may choose to provide.</p>

                    <p>When you register for an Account, we may ask for your contact information, including items such as name, company name, address, email address, and telephone number.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>How we use your information</h3>
                    <p>We use the information we collect in various ways, including to:</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Provide, operate, and maintain our website</li>
                        <li>Improve, personalize, and expand our website</li>
                        <li>Understand and analyze how you use our website</li>
                        <li>Develop new products, services, features, and functionality</li>
                        <li>Communicate with you, either directly or through one of our partners, including for customer service, to provide you with updates and other information relating to the website, and for marketing and promotional purposes</li>
                        <li>Send you emails</li>
                        <li>Find and prevent fraud</li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Log Files</h3>
                    <p>3dpinaka.in follows a standard procedure of using log files. These files log visitors when they visit websites. All hosting companies do this and a part of hosting services' analytics. The information collected by log files include internet protocol (IP) addresses, browser type, Internet Service Provider (ISP), date and time stamp, referring/exit pages, and possibly the number of clicks. These are not linked to any information that is personally identifiable. The purpose of the information is for analyzing trends, administering the site, tracking users' movement on the website, and gathering demographic information.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Cookies and Web Beacons</h3>
                    <p>Like any other website, 3dpinaka.in uses "cookies". These cookies are used to store information, including visitors' preferences, and the pages on the website that the visitor accessed or visited. The information is used to optimize the users' experience by customizing our web page content based on visitors' browser type and/or other information.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Google DoubleClick DART Cookie</h3>
                    <p>Google is one of the third-party vendors on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to www.website.com and other sites on the internet. However, visitors may choose to decline the use of DART cookies by visiting the Google ad and content network Privacy Policy at the following URL - <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>https://policies.google.com/technologies/ads</a></p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Our Advertising Partners</h3>
                    <p>Some of advertisers on our site may use cookies and web beacons. Our advertising partners are listed below. Each of our advertising partners has their own Privacy Policy for their policies on user data. For easier access, we hyperlinked to their Privacy Policies below.</p>
                    <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem' }}>
                        <li>Google <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noreferrer" style={{ color: 'var(--primary)' }}>https://policies.google.com/technologies/ads</a></li>
                    </ul>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Advertising Partners Privacy Policies</h3>
                    <p>You may consult this list to find the Privacy Policy for each of the advertising partners of 3dpinaka.in.</p>
                    <p>Third-party ad servers or ad networks uses technologies like cookies, JavaScript, or Web Beacons that are used in their respective advertisements and links that appear on 3dpinaka.in, which are sent directly to users' browser. They automatically receive your IP address when this occurs. These technologies are used to measure the effectiveness of their advertising campaigns and/or to personalize the advertising content that you see on websites that you visit.</p>
                    <p>Note that 3dpinaka.in has no access to or control over these cookies that are used by third-party advertisers.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Third-Party Privacy Policies</h3>
                    <p>3dpinaka.in's Privacy Policy does not apply to other advertisers or websites. Thus, we are advising you to consult the respective Privacy Policies of these third-party ad servers for more detailed information. It may include their practices and instructions about how to opt-out of certain options.</p>
                    <p>You can choose to disable cookies through your individual browser options. To know more detailed information about cookie management with specific web browsers, it can be found at the browsers' respective websites.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>CCPA Privacy Rights (Do Not Sell My Personal Information)</h3>
                    <p>Under the CCPA, among other rights, California consumers have the right to:</p>
                    <p>Request that a business that collects a consumer's personal data disclose the categories and specific pieces of personal data that a business has collected about consumers.</p>
                    <p>Request that a business delete any personal data about the consumer that a business has collected.</p>
                    <p>Request that a business that sells a consumer's personal data, not sell the consumer's personal data.</p>
                    <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>GDPR Data Protection Rights</h3>
                    <p>We would like to make sure you are fully aware of all of your data protection rights. Every user is entitled to the following:</p>
                    <p>The right to access – You have the right to request copies of your personal data. We may charge you a small fee for this service.</p>
                    <p>The right to rectification – You have the right to request that we correct any information you believe is inaccurate. You also have the right to request that we complete the information you believe is incomplete.</p>
                    <p>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</p>
                    <p>The right to restrict processing – You have the right to request that we restrict the processing of your personal data, under certain conditions.</p>
                    <p>The right to object to processing – You have the right to object to our processing of your personal data, under certain conditions.</p>
                    <p>The right to data portability – You have the right to request that we transfer the data that we have collected to another organization, or directly to you, under certain conditions.</p>
                    <p>If you make a request, we have one month to respond to you. If you would like to exercise any of these rights, please contact us.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Children's Information</h3>
                    <p>Another part of our priority is adding protection for children while using the internet. We encourage parents and guardians to observe, participate in, and/or monitor and guide their online activity.</p>
                    <p>3dpinaka.in does not knowingly collect any Personal Identifiable Information from children under the age of 13. If you think that your child provided this kind of information on our website, we strongly encourage you to contact us immediately, and we will do our best efforts to promptly remove such information from our records.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Changes to This Privacy Policy</h3>
                    <p>We may update our Privacy Policy from time to time. Thus, we advise you to review this page periodically for any changes. We will notify you of any changes by posting the new Privacy Policy on this page. These changes are effective immediately after they are posted on this page.</p>

                    <h3 style={{ color: 'var(--primary)', marginTop: '2rem', marginBottom: '1rem' }}>Contact Us</h3>
                    <p>If you have any questions or suggestions about our Privacy Policy, do not hesitate to <Link to="/support" style={{ color: 'var(--primary)', fontWeight: 600 }}>contact us</Link>.</p>
                </div>
            </section>

            <a href="https://wa.me/918299475268" className="whatsapp-float" target="_blank" rel="noreferrer"><WhatsappLogo size={32} /></a>
        </main>
    );
};

export default PrivacyPolicy;
