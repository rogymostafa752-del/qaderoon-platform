import { useEffect, useMemo, useState } from 'react';

const translations = {
  en: {
    nav: ['Home', 'Services', 'Health', 'Emergency', 'Community', 'AI', 'My Qaderoon'],
    heroTitle: 'Qaderoon | Accessible for everyone',
    heroText:
      'Qaderoon brings together access, inclusion, healthcare, education, communication and community support for people with disabilities.',
    ctaPrimary: 'Explore services',
    ctaSecondary: 'Access support',
    accessibilityCenter: 'Accessibility center',
    textToSpeech: 'Read aloud',
    contrastMode: 'High contrast',
    increaseText: 'Increase text',
    decreaseText: 'Decrease text',
    services: 'Services directory',
    searchPlaceholder: 'Search for hospitals, schools, clinics or support services',
    filters: 'Filters',
    all: 'All',
    healthAccess: 'Health access',
    emergency: 'Emergency & SOS',
    community: 'Community',
    creativity: 'Creativity',
    assistant: 'AI assistant',
    contact: 'Contact',
    save: 'Save',
    submit: 'Submit',
    draft: 'Save draft',
    status: 'Status',
    verified: 'Verified',
    needsVerification: 'Needs verification',
    noResults: 'No services match your filters yet.'
  },
  ar: {
    nav: ['الرئيسية', 'الخدمات', 'الصحة', 'الطوارئ', 'المجتمع', 'الذكاء', 'ملفّي'],
    heroTitle: 'قادرون | الوصول للجميع',
    heroText:
      'تجمع قادرون خدمات الوصول والشمولية والرعاية الصحية والتعليم والتواصل والدعم المجتمعي للأشخاص ذوي الإعاقة.',
    ctaPrimary: 'استكشف الخدمات',
    ctaSecondary: 'احصل على الدعم',
    accessibilityCenter: 'مركز إمكانية الوصول',
    textToSpeech: 'اقرأ بصوت عالٍ',
    contrastMode: 'تباين عالي',
    increaseText: 'تكبير النص',
    decreaseText: 'تصغير النص',
    services: 'دليل الخدمات',
    searchPlaceholder: 'ابحث عن المستشفيات أو المدارس أو العيادات أو الخدمات الداعمة',
    filters: 'الفلاتر',
    all: 'الكل',
    healthAccess: 'الوصول الصحي',
    emergency: 'الطوارئ وسنغ SOS',
    community: 'المجتمع',
    creativity: 'الإبداع',
    assistant: 'المساعد الذكي',
    contact: 'تواصل',
    save: 'حفظ',
    submit: 'إرسال',
    draft: 'حفظ كمسودة',
    status: 'الحالة',
    verified: 'موثقة',
    needsVerification: 'تحتاج تحقق',
    noResults: 'لا توجد خدمات تطابق الفلاتر الحالية.'
  }
};

const categoryOptions = [
  'All',
  'Hospitals',
  'Universities',
  'Schools and educational institutions',
  'Restaurants and cafes',
  'Libraries',
  'Rehabilitation and physiotherapy'
];

function App() {
  const [lang, setLang] = useState('en');
  const [fontScale, setFontScale] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [services, setServices] = useState([]);
  const [impact, setImpact] = useState(null);
  const [search, setSearch] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [assistantQuestion, setAssistantQuestion] = useState('');
  const [assistantReply, setAssistantReply] = useState('');
  const [appointmentForm, setAppointmentForm] = useState({
    fullName: '',
    specialist: '',
    preferredDate: '',
    message: '',
    saveDraft: false
  });
  const [appointmentStatus, setAppointmentStatus] = useState('');
  const [emergencyProfile, setEmergencyProfile] = useState({
    name: '',
    medicalNotes: '',
    contact: '',
    shareLocation: false
  });

  const t = translations[lang];
  const isArabic = lang === 'ar';

  useEffect(() => {
    try {
      const saved = localStorage.getItem('qaderoon-preferences');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.lang) setLang(parsed.lang);
        if (parsed.fontScale) setFontScale(parsed.fontScale);
        if (parsed.highContrast !== undefined) setHighContrast(parsed.highContrast);
      }

      const emergencySaved = localStorage.getItem('qaderoon-emergency-profile');
      if (emergencySaved) {
        setEmergencyProfile(JSON.parse(emergencySaved));
      }
    } catch (error) {
      console.warn('Unable to read Qaderoon saved preferences', error);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(
      'qaderoon-preferences',
      JSON.stringify({ lang, fontScale, highContrast })
    );
  }, [lang, fontScale, highContrast]);

  useEffect(() => {
    fetch('/api/services')
      .then((res) => res.json())
      .then((data) => setServices(data))
      .catch(() => setServices([]));

    fetch('/api/impact')
      .then((res) => res.json())
      .then((data) => setImpact(data))
      .catch(() => setImpact(null));
  }, []);

  const filteredServices = useMemo(() => {
    return services.filter((service) => {
      const matchesCategory = activeCategory === 'All' || service.category === activeCategory;
      const searchText = `${service.name} ${service.description} ${service.category}`.toLowerCase();
      const matchesSearch = searchText.includes(search.trim().toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [services, search, activeCategory]);

  const speakText = () => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'ar' ? 'ميزة قراءة النص لا تدعمها المتصفح الحالي.' : 'Your browser does not support text-to-speech.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(document.body.innerText);
    utterance.lang = lang === 'ar' ? 'ar-SA' : 'en-US';
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleAssistantSubmit = async (e) => {
    e.preventDefault();
    if (!assistantQuestion.trim()) {
      setAssistantReply(lang === 'ar' ? 'يرجى إدخال سؤال.' : 'Please enter a question.');
      return;
    }

    try {
      const res = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: assistantQuestion })
      });
      const data = await res.json();
      setAssistantReply(data.reply || (lang === 'ar' ? 'لا توجد إجابة متاحة.' : 'No answer available yet.'));
    } catch {
      setAssistantReply(lang === 'ar' ? 'تعذر الاتصال بمساعد قادرون.' : 'Unable to connect to the Qaderoon assistant.');
    }
  };

  const submitAppointment = async (saveDraft = false) => {
    const payload = {
      ...appointmentForm,
      saveDraft
    };

    if (!payload.fullName || !payload.specialist || !payload.preferredDate) {
      setAppointmentStatus(
        lang === 'ar'
          ? 'يرجى إدخال الاسم والتخصص وتاريخ الموعد.'
          : 'Please fill in your name, specialist, and preferred date.'
      );
      return;
    }

    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      setAppointmentStatus(data.message || '');

      if (res.ok && saveDraft) {
        setAppointmentForm({
          fullName: '',
          specialist: '',
          preferredDate: '',
          message: '',
          saveDraft: false
        });
      }
    } catch {
      setAppointmentStatus(
        lang === 'ar' ? 'حدث خطأ أثناء إرسال الطلب.' : 'There was a problem submitting your request.'
      );
    }
  };

  const handleAppointmentSubmit = async (e) => {
    e.preventDefault();
    await submitAppointment(false);
  };

  const handleDraftAppointment = () => {
    submitAppointment(true);
  };

  const handleEmergencySave = (e) => {
    e.preventDefault();
    localStorage.setItem('qaderoon-emergency-profile', JSON.stringify(emergencyProfile));
    alert(lang === 'ar' ? 'تم حفظ ملف الطوارئ محلياً.' : 'Emergency profile saved locally.');
  };

  return (
    <div
      className={`app-shell ${highContrast ? 'high-contrast' : ''}`}
      style={{ fontSize: `${fontScale}%` }}
      dir={isArabic ? 'rtl' : 'ltr'}
    >
      <header className="topbar">
        <div className="brand-wrap">
          <div className="brand-mark">ق</div>
          <div>
            <strong>Qaderoon</strong>
            <span>قادرون</span>
          </div>
        </div>

        <nav aria-label="Main navigation" className="main-nav">
          {t.nav.map((item, index) => (
            <a key={item} href={`#${['home', 'services', 'health', 'emergency', 'community', 'assistant', 'profile'][index]}`}>
              {item}
            </a>
          ))}
        </nav>

        <div className="toolbar">
          <button type="button" onClick={() => setLang(lang === 'en' ? 'ar' : 'en')}>
            {lang === 'en' ? 'AR' : 'EN'}
          </button>
          <button type="button" onClick={() => setHighContrast((prev) => !prev)}>{t.contrastMode}</button>
          <button type="button" onClick={() => setFontScale((prev) => Math.min(prev + 10, 140))}>{t.increaseText}</button>
          <button type="button" onClick={() => setFontScale((prev) => Math.max(prev - 10, 90))}>{t.decreaseText}</button>
          <button type="button" onClick={speakText}>{t.textToSpeech}</button>
        </div>
      </header>

      <main>
        <section id="home" className="hero">
          <div className="hero-copy">
            <p className="eyebrow">Qaderoon | قادرون</p>
            <h1>{t.heroTitle}</h1>
            <p>{t.heroText}</p>
            <div className="cta-row">
              <a href="#services" className="primary-btn">{t.ctaPrimary}</a>
              <a href="#health" className="secondary-btn">{t.ctaSecondary}</a>
            </div>
            <div className="mini-stats">
              <div><strong>24/7</strong><span>Support</span></div>
              <div><strong>96</strong><span>Services</span></div>
              <div><strong>41</strong><span>Verified locations</span></div>
            </div>
          </div>

          <div className="hero-panel" aria-label="Accessibility center overview">
            <h2>{t.accessibilityCenter}</h2>
            <ul>
              <li>Speech support</li>
              <li>Keyboard navigation</li>
              <li>High contrast mode</li>
              <li>Accessible forms</li>
              <li>Arabic and English</li>
            </ul>
          </div>
        </section>

        <section className="feature-strip" aria-label="Qaderoon highlights">
          <div className="feature-card">Healthcare access</div>
          <div className="feature-card">Education</div>
          <div className="feature-card">Community</div>
          <div className="feature-card">AI guidance</div>
          <div className="feature-card">Navigation</div>
        </section>

        <section id="services" className="content-section">
          <div className="section-header">
            <h2>{t.services}</h2>
            <span>Searchable and accessible directory</span>
          </div>

          <div className="controls-row">
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.searchPlaceholder}
              aria-label="Service search"
            />
            <select value={activeCategory} onChange={(e) => setActiveCategory(e.target.value)} aria-label="Service filter">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option === 'All' ? t.all : option}</option>
              ))}
            </select>
          </div>

          <div className="services-grid">
            {filteredServices.length > 0 ? (
              filteredServices.map((service) => (
                <article key={service.id} className="service-card">
                  <div className="service-header">
                    <h3>{service.name}</h3>
                    <span className={`badge ${service.verified ? 'verified' : 'unverified'}`}>
                      {service.verified ? t.verified : t.needsVerification}
                    </span>
                  </div>
                  <p>{service.category}</p>
                  <p>{service.description}</p>
                  <ul>
                    <li>{service.address}</li>
                    <li>{service.phone}</li>
                    <li>{service.accessibility}</li>
                  </ul>
                </article>
              ))
            ) : (
              <div className="empty-state">{t.noResults}</div>
            )}
          </div>
        </section>

        <section id="health" className="content-section two-col">
          <div>
            <div className="section-header">
              <h2>{t.healthAccess}</h2>
              <span>Healthcare support and appointments</span>
            </div>

            <div className="info-panel">
              <h3>Healthcare guidance</h3>
              <ul>
                <li>Hospital and clinic directory</li>
                <li>Specialist access</li>
                <li>Physiotherapy and rehabilitation services</li>
                <li>Emergency contact information</li>
              </ul>
            </div>
          </div>

          <form className="form-card" onSubmit={handleAppointmentSubmit}>
            <h3>Appointment request</h3>
            <label>
              Full name
              <input
                type="text"
                value={appointmentForm.fullName}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, fullName: e.target.value })}
              />
            </label>
            <label>
              Specialist or clinic
              <input
                type="text"
                value={appointmentForm.specialist}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, specialist: e.target.value })}
              />
            </label>
            <label>
              Preferred date
              <input
                type="date"
                value={appointmentForm.preferredDate}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, preferredDate: e.target.value })}
              />
            </label>
            <label>
              Additional details
              <textarea
                rows="3"
                value={appointmentForm.message}
                onChange={(e) => setAppointmentForm({ ...appointmentForm, message: e.target.value })}
              />
            </label>
            <div className="checkbox-row">
              <label>
                <input
                  type="checkbox"
                  checked={appointmentForm.saveDraft}
                  onChange={(e) => setAppointmentForm({ ...appointmentForm, saveDraft: e.target.checked })}
                />
                Save as draft
              </label>
            </div>
            <div className="button-row">
              <button type="submit" className="primary-btn">{t.submit}</button>
              <button type="button" className="secondary-btn" onClick={handleDraftAppointment}>{t.draft}</button>
            </div>
            {appointmentStatus && <p className="status-message">{appointmentStatus}</p>}
          </form>
        </section>

        <section id="emergency" className="content-section two-col">
          <div>
            <div className="section-header">
              <h2>{t.emergency}</h2>
              <span>Privacy-first emergency support</span>
            </div>
            <div className="info-panel">
              <h3>Emergency guidance</h3>
              <ul>
                <li>Call official emergency services first when in immediate danger</li>
                <li>Share location only with explicit consent</li>
                <li>Trusted contacts can be saved privately</li>
                <li>Accessibility-aware guidance remains supportive, not a substitute for emergency care</li>
              </ul>
            </div>
          </div>

          <form className="form-card" onSubmit={handleEmergencySave}>
            <h3>Personal emergency profile</h3>
            <label>
              Full name
              <input
                type="text"
                value={emergencyProfile.name}
                onChange={(e) => setEmergencyProfile({ ...emergencyProfile, name: e.target.value })}
              />
            </label>
            <label>
              Medical notes
              <textarea
                rows="3"
                value={emergencyProfile.medicalNotes}
                onChange={(e) => setEmergencyProfile({ ...emergencyProfile, medicalNotes: e.target.value })}
              />
            </label>
            <label>
              Trusted contact
              <input
                type="text"
                value={emergencyProfile.contact}
                onChange={(e) => setEmergencyProfile({ ...emergencyProfile, contact: e.target.value })}
              />
            </label>
            <label className="checkbox-row">
              <input
                type="checkbox"
                checked={emergencyProfile.shareLocation}
                onChange={(e) => setEmergencyProfile({ ...emergencyProfile, shareLocation: e.target.checked })}
              />
              Consent to share location when needed
            </label>
            <button type="submit" className="primary-btn">{t.save}</button>
          </form>
        </section>

        <section id="community" className="content-section">
          <div className="section-header">
            <h2>{t.community}</h2>
            <span>Safe, respectful discussion and support</span>
          </div>
          <div className="card-grid three-up">
            <article className="mini-card">
              <h3>Stories</h3>
              <p>Share experiences and practical ideas with the community.</p>
            </article>
            <article className="mini-card">
              <h3>Discussions</h3>
              <p>Discuss challenges, solutions and accessibility resources.</p>
            </article>
            <article className="mini-card">
              <h3>Moderation</h3>
              <p>Content is reviewed for safety, respect and privacy.</p>
            </article>
          </div>
        </section>

        <section className="content-section">
          <div className="section-header">
            <h2>{t.creativity}</h2>
            <span>Creative talent, expression and advocacy</span>
          </div>
          <div className="card-grid three-up">
            <article className="mini-card"><h3>Art</h3><p>Show visual work and accessible media.</p></article>
            <article className="mini-card"><h3>Writing</h3><p>Publish stories, poems and educational pieces.</p></article>
            <article className="mini-card"><h3>Achievements</h3><p>Highlight milestones and community impact.</p></article>
          </div>
        </section>

        <section id="assistant" className="content-section two-col">
          <div>
            <div className="section-header">
              <h2>{t.assistant}</h2>
              <span>Helpful answers and platform guidance</span>
            </div>
            <div className="info-panel">
              <h3>Assistant capabilities</h3>
              <ul>
                <li>Answer common Qaderoon questions</li>
                <li>Guide users to sections and services</li>
                <li>Support Arabic and English responses</li>
                <li>Show a secure status when external AI is unavailable</li>
              </ul>
            </div>
          </div>

          <form className="form-card" onSubmit={handleAssistantSubmit}>
            <h3>Ask the assistant</h3>
            <textarea
              rows="4"
              value={assistantQuestion}
              onChange={(e) => setAssistantQuestion(e.target.value)}
              placeholder="How can Qaderoon help me find accessible healthcare services?"
            />
            <button type="submit" className="primary-btn">Send</button>
            {assistantReply && <p className="status-message">{assistantReply}</p>}
          </form>
        </section>

        <section className="module-grid">
          <article className="module-card">
            <h3>Qaderoon Vision</h3>
            <p>Camera-assisted text reading and object description are planned with clear accuracy warnings and consent safeguards.</p>
          </article>
          <article className="module-card">
            <h3>Qaderoon Navigator</h3>
            <p>Accessible route guidance and nearby services with location-specific accessibility info.</p>
          </article>
          <article className="module-card">
            <h3>Qaderoon Sign</h3>
            <p>Sign language resources and guidance; recognition tools require expert testing and suitable datasets.</p>
          </article>
          <article className="module-card">
            <h3>Qaderoon Voice</h3>
            <p>Voice interaction with text-based fallback support for accessibility.</p>
          </article>
          <article className="module-card">
            <h3>Qaderoon Learn</h3>
            <p>Learning resources and practical digital skills for inclusive growth.</p>
          </article>
          <article className="module-card">
            <h3>Qaderoon Careers</h3>
            <p>Jobs, training and skills opportunities with verification status.</p>
          </article>
          <article className="module-card">
            <h3>Smart Life</h3>
            <p>Assistive technology education and compatible smart-home guidance.</p>
          </article>
          <article className="module-card" id="profile">
            <h3>My Qaderoon</h3>
            <p>Profile, language settings, accessibility preferences, saved services, and private controls.</p>
          </article>
        </section>

        <section className="content-section">
          <div className="section-header">
            <h2>Impact</h2>
            <span>Real platform data only</span>
          </div>

          <div className="stats-grid">
            {impact ? (
              <>
                <div className="stat-box"><strong>{impact.users.toLocaleString()}</strong><span>Registered users</span></div>
                <div className="stat-box"><strong>{impact.listedServices}</strong><span>Listed services</span></div>
                <div className="stat-box"><strong>{impact.verifiedLocations}</strong><span>Verified accessible locations</span></div>
                <div className="stat-box"><strong>{impact.communityContributions}</strong><span>Community contributions</span></div>
                <div className="stat-box"><strong>{impact.educationalResources}</strong><span>Educational resources</span></div>
                <div className="stat-box"><strong>{impact.engagement}</strong><span>Platform engagement</span></div>
              </>
            ) : (
              <p>Loading platform impact data…</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
