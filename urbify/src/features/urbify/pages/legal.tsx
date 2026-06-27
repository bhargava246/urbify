// @ts-nocheck
"use client";
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { reverseGeocode, autocomplete } from '@/lib/olamaps';
import {
  LISTINGS, CITIES, LOCALITIES, PHOTOS, INTERIORS, FURNISHING, FACINGS, AMENITIES,
  furnishingLabel, facingLabel, ageLabel, postedLabel, normalizeApiListing,
  AppDataContext, useAppData, OlaMap,
  Icon, Logo, Img, LockedAddress, ListingCard, Modal,
  PortalShell, StatCard, StatusBadge, DashHeader, Footer,
} from '../_shared';

function LegalPage({nav, kind}) {
  const docs = {
    terms: {
      title: "Terms of Service",
      eyebrow: "The agreement between you and us",
      version: "Version 4.2",
      updated: "Updated May 1, 2026",
      tldr: [
        "Use Urbify in good faith. Don't post fake listings, don't scrape data, don't try to bypass the platform.",
        "All transactions and disputes go through the platform — that's how the privacy and refund system works.",
        "If you list a property, you agree it's yours to list (or you have permission). If you're a broker, you must have a valid RERA ID where applicable.",
        "We can suspend accounts that break these rules. You can leave at any time.",
        "This is a fair, plain-language version of our terms. The full legal version is below.",
      ],
      sections: [
        {
          h: "1. Acceptance of these terms",
          p: [
            "By creating an Urbify account or using urbify.in, you agree to these Terms of Service ('Terms'). If you don't agree, please don't use the service.",
            "These Terms govern your relationship with Urbify Technologies Pvt. Ltd. ('Urbify', 'we', 'us'). We may amend them from time to time — material changes will be notified at least 30 days in advance via email and an in-app banner.",
          ],
        },
        {
          h: "2. Who can use Urbify",
          p: [
            "You must be at least 18 years old and capable of forming a legally binding contract under Indian law. By signing up, you represent and warrant that you meet these criteria.",
            "If you are using Urbify on behalf of an organisation (e.g. a brokerage firm), you represent that you have the authority to bind that organisation to these Terms.",
            "Brokers must hold a valid RERA registration in jurisdictions where one is required. We verify RERA IDs monthly against state RERA portals.",
          ],
        },
        {
          h: "3. Your account",
          p: [
            "Account creation requires a verified Indian mobile number. You are responsible for all activity on your account. Keep your login credentials secure.",
            "You agree to provide accurate information and to update it when it changes. Providing false information may result in account suspension.",
            "We may verify your identity using public registries (RERA, GST) and request additional documents in cases of suspected fraud.",
          ],
        },
        {
          h: "4. Listings & content",
          p: [
            "Owners and brokers may post listings only for properties they own or are authorised to represent. Posting fraudulent, duplicate, or misleading listings is grounds for immediate removal and possible account termination.",
            "By posting a listing, you grant Urbify a non-exclusive, royalty-free, worldwide licence to host, display, and distribute the listing content on the Urbify platform and in associated marketing materials. You retain ownership of your content.",
            "Photos must be of the property listed. AI-generated, stock, or unrelated photos are not permitted. We use automated pre-screening to detect these.",
            "Listings are reviewed before going live (target SLA: under 2 hours). We reserve the right to reject or modify listings that violate our content policy.",
          ],
        },
        {
          h: "5. Fees & payments",
          p: [
            "Listing on Urbify is free for owners and brokers. There are no listing fees, renewal fees, or feature fees.",
            "Tenants/buyers pay a platform fee to unlock the owner's contact details and full property address. The fee is 50% of market brokerage (calculated as rent ÷ 30 × 7.5) plus 18% GST. The full calculation is shown before payment.",
            "Payments are processed via PhonePe, a licensed payment aggregator. We do not store full card or bank details on our servers.",
            "All fees are inclusive of GST where applicable. A tax invoice is issued and emailed to the paying user.",
          ],
        },
        {
          h: "6. Refunds",
          p: [
            "If a tenant unlocks a listing and finds the address or owner contact to be invalid, unreachable, or materially different from what was advertised, they may request a refund within 24 hours of the unlock.",
            "Verified refund requests are processed automatically to the original payment method within 5-7 business days. Refer to our Refund Policy for the complete process.",
          ],
        },
        {
          h: "7. Prohibited conduct",
          p: [
            "You may not: post false or misleading listings; scrape, mirror, or republish Urbify data; bypass the unlock mechanism to obtain owner contact details; use Urbify for any purpose other than its intended use; harass or solicit other users; impersonate another person or organisation.",
            "Violation may result in immediate suspension and, where applicable, legal action.",
          ],
        },
        {
          h: "8. Termination",
          p: [
            "You may close your account at any time from your account settings. Past transaction records are retained as required by law (Income Tax Act, GST Act, KYC regulations).",
            "We may suspend or terminate accounts that violate these Terms, with notice where reasonable. Repeat or serious violations may result in termination without notice.",
          ],
        },
        {
          h: "9. Limitation of liability",
          p: [
            "Urbify is a marketplace that connects owners, brokers, and tenants. We are not a party to the actual rental or sale transaction. We do not own, manage, or guarantee any listed property.",
            "To the maximum extent permitted by Indian law, Urbify's aggregate liability to any user arising from or related to the service is limited to the total platform fees paid by that user in the 12 months preceding the claim.",
          ],
        },
        {
          h: "10. Governing law & dispute resolution",
          p: [
            "These Terms are governed by the laws of India. Disputes are subject to the exclusive jurisdiction of the courts at Bangalore, Karnataka.",
            "Before initiating legal action, parties agree to attempt resolution through our Grievance Officer (see Contact page). Most disputes are resolved within 30 days of receipt.",
          ],
        },
      ],
    },

    privacy: {
      title: "Privacy Policy",
      eyebrow: "How we handle your data",
      version: "Version 3.1",
      updated: "Updated May 1, 2026",
      tldr: [
        "We collect what we need to run the service — your name, phone, email, and the listings/searches you interact with. Nothing more.",
        "Property addresses are encrypted at rest and revealed only to tenants who have paid the platform fee.",
        "We do not sell, lease, or syndicate user data to third parties. Ever.",
        "You can request a full export of your data, or delete your account, at any time from Settings.",
        "We comply with the Digital Personal Data Protection Act, 2023 and applicable IT Rules.",
      ],
      sections: [
        {
          h: "1. Data we collect",
          p: [
            "Account info: name, mobile number (verified via OTP), email address, optional profile photo.",
            "Listing data (for owners/brokers): property details, photos, address (encrypted), pricing, availability.",
            "Search and activity data: cities and localities you browse, properties you shortlist, listings you unlock.",
            "Payment data: handled by our payment processor (PhonePe). We store transaction IDs and amounts; full card and bank details are never stored on Urbify servers.",
            "Device and log data: IP address, browser type, device identifiers, timestamps. Used for security and analytics only.",
          ],
        },
        {
          h: "2. How we use your data",
          p: [
            "To run the service: match tenants with listings, process payments, send transactional notifications (SMS, email).",
            "To verify users: cross-check RERA IDs for brokers, prevent fraud, comply with KYC requirements.",
            "To improve the product: aggregated, anonymised analytics about which features work and which don't.",
            "To send marketing (only with your explicit consent): the weekly newsletter, new-feature announcements.",
            "To comply with law: respond to lawful requests from regulators, tax authorities, and courts.",
          ],
        },
        {
          h: "3. The privacy-first listing model",
          p: [
            "Property addresses are stored encrypted using industry-standard AES-256 encryption. The encryption key is held in a separate secure key management service.",
            "Before a tenant unlocks a listing, only the locality (e.g. 'Koramangala 4th Block') and a fuzzy zone polygon on the map are shown. The exact street address and the owner's phone number are not displayed anywhere — including to other brokers or to our own customer service team without a documented business reason.",
            "After a tenant pays the platform fee, the address and phone number are revealed to that tenant. The unlock event is logged for the owner's records.",
          ],
        },
        {
          h: "4. Who we share data with",
          p: [
            "Payment processors (PhonePe) — only the minimum data required to process the transaction.",
            "Verification partners — to verify RERA IDs, PAN, GST numbers, etc.",
            "Cloud infrastructure providers (AWS Mumbai, India region) — for hosting and storage. Data does not leave India.",
            "Law enforcement and regulators — when legally required. We push back on requests we believe are overbroad.",
            "We do not sell or rent user data to anyone, ever. We do not share data with advertising networks for targeting.",
          ],
        },
        {
          h: "5. Data retention",
          p: [
            "Active account data is retained for as long as your account is active.",
            "After account deletion, we retain transaction records for 7 years as required by the Income Tax Act and GST Act.",
            "Listing data is retained for 3 years after a listing is marked rented or expired, to support market analytics and dispute resolution.",
            "Anonymised aggregate data may be retained indefinitely.",
          ],
        },
        {
          h: "6. Your rights",
          p: [
            "Access: request a copy of all data we hold about you, from Settings → Privacy → Export.",
            "Correction: update your profile information at any time from Settings.",
            "Deletion: request account and data deletion at any time. Some records are retained for legal compliance.",
            "Withdrawal of consent: opt out of marketing emails at any time. Transactional messages cannot be opted out of while your account is active.",
            "Grievance: contact our Data Protection Officer at dpo@urbify.in. Response within 30 days.",
          ],
        },
        {
          h: "7. Security",
          p: [
            "We use TLS 1.3 for all data in transit and AES-256 for data at rest.",
            "Payment data is handled by PCI-DSS compliant partners; we are out-of-scope for PCI.",
            "Annual third-party security audits and quarterly penetration testing.",
            "In the unlikely event of a data breach, we notify affected users within 72 hours and report to the Indian Computer Emergency Response Team (CERT-In) within 6 hours, as required.",
          ],
        },
        {
          h: "8. Cookies & tracking",
          p: [
            "We use essential cookies for authentication and session management — these cannot be disabled.",
            "We use first-party analytics cookies (no third-party trackers). You can opt out from Settings → Privacy.",
            "We do not use cross-site advertising trackers, retargeting pixels, or fingerprinting.",
          ],
        },
        {
          h: "9. Children",
          p: [
            "Urbify is not intended for users under 18. We do not knowingly collect data from minors. If you believe a minor has created an account, contact us immediately.",
          ],
        },
        {
          h: "10. Contact",
          p: [
            "Data Protection Officer: dpo@urbify.in",
            "Grievance Officer (Consumer Protection Act 2019): grievance@urbify.in · +91 80-4567-8901",
            "Registered office: 4th Floor, Diamond District, HAL Old Airport Road, Bangalore 560008",
          ],
        },
      ],
    },

    refund: {
      title: "Refund Policy",
      eyebrow: "When and how we refund",
      version: "Version 2.0",
      updated: "Updated May 1, 2026",
      tldr: [
        "You have 24 hours after unlocking a listing to request a refund if something's materially wrong — invalid address, unreachable owner, listing already rented, etc.",
        "Verified refund requests are processed automatically within 5-7 business days to the original payment method.",
        "Owners pay nothing, so there's nothing to refund on their end. This policy is for tenants who paid the unlock fee.",
        "Subscription products, multi-pack unlocks, and other premium features have their own refund terms specified at purchase.",
      ],
      sections: [
        {
          h: "1. Eligible refund reasons",
          p: [
            "You're eligible for a full refund of the platform fee if any of the following applies, and you flag it within 24 hours of unlocking:",
            "(a) The address provided is incorrect or doesn't exist at the stated location.",
            "(b) The owner's phone number is invalid, disconnected, or unreachable after 3 documented attempts over 24 hours.",
            "(c) The property has already been rented or sold prior to your unlock (and the listing was not marked accordingly).",
            "(d) The property as described differs materially from reality (e.g. listed as 2 BHK but is actually 1 BHK; listed as semi-furnished but is bare-shell).",
            "(e) Duplicate unlock — you accidentally paid twice for the same listing within a short window.",
          ],
        },
        {
          h: "2. How to request a refund",
          p: [
            "From your Transactions page (Settings → Transactions), find the unlock you want to refund and click 'Report issue'.",
            "Select the reason and add a short note explaining what happened. You may attach screenshots, call logs, or other evidence.",
            "Most refund requests are auto-approved by our system based on heuristics (e.g. if your call log shows three failed attempts in 24 hours). For ambiguous cases, a human reviewer looks at the request within 24 business hours.",
          ],
        },
        {
          h: "3. Processing times",
          p: [
            "Decision: most refunds are decided within 6 hours of being raised; complex cases within 48 hours.",
            "Payment processing: 5-7 business days back to your original payment method. UPI and wallet refunds are typically faster (1-2 days); card and net-banking refunds take longer due to bank settlement cycles.",
            "If the refund hasn't appeared in your account 10 business days after approval, contact billing@urbify.in with your transaction ID.",
          ],
        },
        {
          h: "4. What's not refundable",
          p: [
            "Unlocks where you successfully reached the owner and either viewed the property or decided not to rent it. The platform fee is for the access, not for a guarantee that you'll rent it.",
            "Unlocks where you waited more than 24 hours to report the issue. We can't verify after-the-fact whether the listing was valid at the time you unlocked it.",
            "Unlocks where the dispute is over a non-platform issue — e.g. negotiation didn't go your way, the owner changed their mind, the broker quoted a different commission, etc. These are matters between you and the listing party.",
          ],
        },
        {
          h: "5. Disputed refunds",
          p: [
            "If we decline your refund and you disagree, you can escalate to our Grievance Officer within 7 days. Escalations are reviewed independently and a final decision is communicated within 14 days.",
            "If the Grievance Officer's decision is also unsatisfactory, you may pursue remedy via consumer courts or the relevant ombudsman.",
          ],
        },
        {
          h: "6. Refund fraud",
          p: [
            "We use behavioural signals and pattern analysis to detect abusive refund requests (e.g. unlocking the same listing under different accounts and claiming refunds repeatedly).",
            "Accounts that engage in refund fraud are subject to permanent suspension and may be reported to law enforcement under the Information Technology Act and the Indian Penal Code.",
          ],
        },
      ],
    },
  };

  const doc = docs[kind];

  // Build TOC from sections
  return (
    <div>
      <section style={{padding:'56px 28px 32px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{fontSize:12, color:'var(--text-muted)', marginBottom:18}}>
          <span style={{cursor:'pointer'}} onClick={()=>nav('home')}>Home</span> / Legal / <span style={{color:'var(--text)'}}>{doc.title}</span>
        </div>

        <div className="chip" style={{background:'transparent', border:'1px solid var(--border-strong)', marginBottom:20}}>{doc.eyebrow}</div>
        <h1 className="font-display" style={{fontSize:'clamp(40px, 6vw, 72px)', fontWeight:800, letterSpacing:'-0.04em', lineHeight:1, margin:0}}>
          {doc.title}
        </h1>
        <div style={{display:'flex', gap:18, marginTop:18, fontSize:13, color:'var(--text-muted)', flexWrap:'wrap'}}>
          <span style={{fontFamily:'var(--f-mono)'}}>{doc.version}</span>
          <span>·</span>
          <span>{doc.updated}</span>
          <span>·</span>
          <span style={{cursor:'pointer', textDecoration:'underline'}}>Download PDF</span>
          <span>·</span>
          <span style={{cursor:'pointer', textDecoration:'underline'}}>View changelog</span>
        </div>
      </section>

      {/* TL;DR card */}
      <section style={{padding:'24px 28px 24px', maxWidth:1280, margin:'0 auto'}}>
        <div className="card" style={{padding:32, background:'var(--brand-50)', border:0}}>
          <div style={{display:'flex', alignItems:'center', gap:10, marginBottom:14}}>
            <span style={{fontSize:18, color:'var(--brand-500)'}}><Icon.bolt/></span>
            <div style={{fontSize:12, color:'var(--brand-700)', textTransform:'uppercase', letterSpacing:'.1em', fontWeight:700}}>TL;DR · the plain-language version</div>
          </div>
          <ul style={{margin:0, padding:0, listStyle:'none', display:'flex', flexDirection:'column', gap:10}}>
            {doc.tldr.map((line, i)=>(
              <li key={i} style={{display:'flex', gap:14, fontSize:15, lineHeight:1.55, color:'var(--brand-900)'}}>
                <span style={{minWidth:18, fontWeight:700}}>·</span>
                <span>{line}</span>
              </li>
            ))}
          </ul>
          <div style={{fontSize:12, color:'var(--brand-700)', marginTop:18, fontStyle:'italic'}}>The summary above is for clarity; the full legal terms below are what's binding.</div>
        </div>
      </section>

      {/* Body */}
      <section style={{padding:'40px 28px 96px', maxWidth:1280, margin:'0 auto'}}>
        <div style={{display:'grid', gridTemplateColumns:'240px 1fr', gap:64, alignItems:'start'}}>
          {/* TOC */}
          <aside style={{position:'sticky', top:88}}>
            <div style={{fontSize:11, color:'var(--text-muted)', fontWeight:700, textTransform:'uppercase', letterSpacing:'.1em', marginBottom:14}}>On this page</div>
            <ul style={{listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:8, fontSize:13}}>
              {doc.sections.map((s, i)=>(
                <li key={i} style={{
                  borderLeft:'2px solid var(--border)', paddingLeft:12,
                  color:'var(--text-muted)', cursor:'pointer',
                  lineHeight:1.4,
                }}>{s.h}</li>
              ))}
            </ul>

            <div style={{marginTop:32, padding:18, background:'var(--surface-sunken)', borderRadius:'var(--r-md)'}}>
              <div style={{fontSize:11, color:'var(--text-muted)', textTransform:'uppercase', letterSpacing:'.08em', fontWeight:700, marginBottom:10}}>Related</div>
              <div style={{display:'flex', flexDirection:'column', gap:6, fontSize:13}}>
                {kind !== 'terms' && <a style={{color:'var(--text)', cursor:'pointer'}} onClick={()=>nav('terms')}>Terms of Service</a>}
                {kind !== 'privacy' && <a style={{color:'var(--text)', cursor:'pointer'}} onClick={()=>nav('privacy')}>Privacy Policy</a>}
                {kind !== 'refund' && <a style={{color:'var(--text)', cursor:'pointer'}} onClick={()=>nav('refund')}>Refund Policy</a>}
                <a style={{color:'var(--text)', cursor:'pointer'}} onClick={()=>nav('contact')}>Grievance officer</a>
              </div>
            </div>
          </aside>

          {/* Body text */}
          <div style={{maxWidth:720}}>
            {doc.sections.map((s, i)=>(
              <div key={i} style={{marginTop: i===0 ? 0 : 48}}>
                <h2 className="font-display" style={{fontSize:28, fontWeight:700, letterSpacing:'-0.025em', margin:'0 0 16px', lineHeight:1.2}}>{s.h}</h2>
                {s.p.map((p, j)=>(
                  <p key={j} style={{fontSize:16, lineHeight:1.75, color:'var(--text)', margin:'0 0 14px'}}>{p}</p>
                ))}
              </div>
            ))}

            <div style={{marginTop:64, padding:24, background:'var(--surface-sunken)', borderRadius:'var(--r-md)', fontSize:13, color:'var(--text-muted)', lineHeight:1.6}}>
              <div style={{fontWeight:600, color:'var(--text)', marginBottom:6}}>Questions about this policy?</div>
              Reach out to <a style={{color:'var(--brand-500)', textDecoration:'underline'}} onClick={()=>nav('contact')}>our Grievance Officer</a> — most queries get a real-human reply within 4 hours.
            </div>
          </div>
        </div>
      </section>

    </div>
  );
}

function TermsPage(props)   { return <LegalPage {...props} kind="terms"/>; }
function PrivacyPage(props) { return <LegalPage {...props} kind="privacy"/>; }
function RefundPage(props)  { return <LegalPage {...props} kind="refund"/>; }


export { LegalPage, TermsPage, PrivacyPage, RefundPage };
