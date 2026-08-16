import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  HelpCircle, Search, BookOpen, FlaskConical, Scale, ShieldCheck, 
  Video, AlertTriangle, ChevronDown, ChevronUp, Sparkles, CheckCircle2, 
  ArrowLeft, FileText, Lock, Award, HeartHandshake, Eye, Bot, RefreshCw
} from 'lucide-react';
import './Help.css';

const FAQS = [
  {
    id: 'faq-1',
    category: 'Practical Mode',
    question: 'How can I perform an experiment in Practical Sandbox Mode?',
    summary: 'Step-by-step practical tutorial: selecting apparatus, measuring herbs, executing classical laboratory actions, and obtaining final compounds.',
    icon: <FlaskConical className="faq-icon" />,
    content: (
      <div className="faq-answer-flow">
        <p>
          The <strong>Practical Sandbox</strong> is an interactive virtual ayurvedic pharmacy designed according to classical texts (<em>Rasa Shastra & Bhaishajya Kalpana</em>). To perform any of the formulation experiments, follow this SOP sequence:
        </p>
        <ol className="faq-steps-list">
          <li>
            <strong>1. Place the Utensil (Yantra / Patra):</strong> Look under the <em>Utensils</em> tab in the inventory sidebar. Drag and drop the required apparatus (e.g. <code>Khalva yantra</code> for Churnas/Vatis, <code>Steel vessel</code> or <code>Taila-patra</code> for Taila/Ghrita paka) into the center canvas area.
          </li>
          <li>
            <strong>2. Measure & Add Ingredients (Dravya Pramana):</strong> Select the ingredients from the inventory and drag them directly into the placed vessel. A <strong>Weight Modal</strong> will prompt you to enter the exact proportional amount in grams (g) or milliliters (ml).
          </li>
          <li>
            <strong>3. Execute Sequential Actions:</strong> Open the <em>Actions Panel</em> and click the required laboratory processes in classical order:
            <ul className="sub-actions-list">
              <li><code>⚙️ Grind (Mardana)</code>: Pulverizes dry dravyas into fine powder (Churna).</li>
              <li><code>🕸️ Sieve (Vastragala)</code>: Sieves powder through fine 80-mesh cloth.</li>
              <li><code>🔥 Heat (Agni Paka)</code>: Applies Mandagni/Madhyamagni heat to boil decoctions or medicate oils/ghritas.</li>
              <li><code>🌊 Filter (Kvatha/Siddhi)</code>: Strains liquids or separates herbal kalka through sterile cloth.</li>
              <li><code>🔄 Mix (Samyoga/Bhavana)</code>: Homogeneously stirs dry powders or triturates with swarasa liquids.</li>
              <li><code>💊 Form Pills (Vati/Varti)</code>: Rolls the triturated paste into pills, gutikas, or suppositories.</li>
            </ul>
          </li>
          <li>
            <strong>4. Siddhi Lakshana & Compound Generation:</strong> Once all ingredients and actions match the formulation criteria, the mixture transforms into the final compound with its classical Ayurvedic characteristics.
          </li>
        </ol>
        <div className="faq-tip-box">
          <Sparkles size={16} />
          <span><strong>Pro-Tip:</strong> Check the <strong>E-Library</strong> or <strong>Master Practical Guide</strong> before beginning to know the exact apparatus and step order for each of the 38 formulations.</span>
        </div>
      </div>
    )
  },
  {
    id: 'faq-2',
    category: 'Ratios & Calculations',
    question: 'How can we identify and calculate ingredient ratios and proportions?',
    summary: 'Learn how classical Ayurvedic Dravya proportions (e.g. 16:8:4:2:1 or equal parts) are calculated and validated in the sandbox.',
    icon: <Scale className="faq-icon" />,
    content: (
      <div className="faq-answer-flow">
        <p>
          Classical Ayurvedic texts define formulations using <strong>relative parts (Bhaaga)</strong> rather than fixed metric units. The virtual lab calculates validation based on these exact proportional relationships:
        </p>
        <div className="faq-ratio-cards">
          <div className="ratio-example-card">
            <h4>Example 1: Sitopaladi Churna (16 : 8 : 4 : 2 : 1)</h4>
            <p>Formula: Sita (16) : Vamsharochana (8) : Pippali (4) : Ela (2) : Twak (1)</p>
            <div className="ratio-math">
              If base <code>Twak = 10g</code>, then <code>Ela = 20g</code>, <code>Pippali = 40g</code>, <code>Vamsharochana = 80g</code>, and <code>Sita = 160g</code>.
            </div>
          </div>
          <div className="ratio-example-card">
            <h4>Example 2: Hingwastaka Churna (1 : 1 : 1 : 1 : 1 : 1 : 1 : 1)</h4>
            <p>Formula: Equal parts of all 8 active herbs (Sunthi, Maricha, Pippali, Ajmoda, Saindhava, Shweta Jiraka, Krishna Jiraka, Su. Hingu).</p>
            <div className="ratio-math">
              Every herb must be entered with the exact same weight (e.g., <code>30g each</code>).
            </div>
          </div>
        </div>
        <p>
          <strong>Why ratios matter:</strong> If any ingredient proportion deviates significantly from the classical text, the validation engine flags an error and the compound will fail to synthesize or be destroyed to enforce strict pharmaceutical accuracy.
        </p>
      </div>
    )
  },
  {
    id: 'faq-3',
    category: 'Exam Mode & Proctoring',
    question: 'How does the Examination & AI Proctoring Mode work?',
    summary: 'Understand camera background monitoring, browser tab restrictions, and academic integrity protocols during practical exams.',
    icon: <ShieldCheck className="faq-icon" />,
    content: (
      <div className="faq-answer-flow">
        <p>
          When an administrator or instructor enables <strong>Practical Exam Mode</strong>, strict academic integrity mechanisms are automatically enforced:
        </p>
        <ul className="faq-bullets-list">
          <li>
            <strong>Background Camera Monitoring:</strong> Your webcam records the exam session in the background via local <code>MediaRecorder</code>. To prevent visual distraction while formulating, the video feed is hidden from your screen and represented by a minimal status HUD.
          </li>
          <li>
            <strong>Locked Navigation:</strong> Access to the <code>E-Library (/learning)</code> is restricted during exam mode. The top Navbar is locked and direct canvas exit is disabled until you click <strong>"Finish Exam"</strong>.
          </li>
          <li>
            <strong>Submission & Audit:</strong> Upon finishing your exam, the session recording and action history are encrypted and stored for faculty review and practical assessment grading.
          </li>
        </ul>
      </div>
    )
  },
  {
    id: 'faq-4',
    category: 'Learning & AI Tutor',
    question: 'How can I use the AI Tutor and Video Demonstrations in Learning Mode?',
    summary: 'Guide to watching HeyGen/cinema video guides, exploring shlokas, and chatting with the specialized Ayurvedic AI Tutor.',
    icon: <Video className="faq-icon" />,
    content: (
      <div className="faq-answer-flow">
        <p>
          The <strong>E-Library (/learning)</strong> is your interactive textbook and research companion:
        </p>
        <div className="faq-feature-grid">
          <div className="feature-item">
            <div className="feature-header"><Video size={18} /> <strong>Cinema Mode Videos</strong></div>
            <p>Click the floating <strong>Video</strong> button on any experiment detail page to watch high-definition AI demonstrations and classical SOP walkthroughs (such as <em>Taila Murchana</em>, <em>Agnitundi Vati</em>, etc.).</p>
          </div>
          <div className="feature-item">
            <div className="feature-header"><Bot size={18} /> <strong>Ayurvedic AI Tutor</strong></div>
            <p>Click the floating <strong>Tutor</strong> button to open the AI assistant. Ask questions regarding Sanskrit Shloka meanings, classical references, therapeutic indications (<em>Rogaghnata</em>), contraindications, and Matra/Anupana.</p>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 'faq-5',
    category: 'Troubleshooting',
    question: 'What should I do if an experiment fails or the compound is destroyed?',
    summary: 'Troubleshoot common simulation errors, proportion mismatches, missing steps, and learn how to reset the workbench.',
    icon: <AlertTriangle className="faq-icon" />,
    content: (
      <div className="faq-answer-flow">
        <p>
          If you see a <em>"💥 Compound Destroyed!"</em> or <em>"⚠️ Incorrect Sequence"</em> notification, this indicates a deviation from classical pharmaceutical preparation standards:
        </p>
        <ul className="faq-bullets-list">
          <li>
            <strong>Check Proportions:</strong> Double check that you entered the right ratio (e.g. not confusing a 16-part dravya with a 1-part prakshepa dravya).
          </li>
          <li>
            <strong>Check Step Order:</strong> Dry herbs must be powdered and sieved <em>before</em> adding liquids or boiling; heating steps must precede filtration.
          </li>
          <li>
            <strong>Reset Workbench:</strong> Click <strong>"🔄 Reset Lab"</strong> in the canvas or actions panel to clear the vessel and start fresh with a clean utensil.
          </li>
        </ul>
      </div>
    )
  }
];

const POLICIES = [
  {
    id: 'policy-academic',
    title: '1. Academic Integrity & Examination Ethics',
    icon: <Award className="policy-icon" />,
    text: 'All practical simulations and examination assessments conducted on the AI Ayurveda Lab must reflect the student\'s own independent clinical understanding. Unauthorized external assistance, tampering with browser monitoring feeds, or attempting to bypass locked examination states constitutes a violation of university laboratory academic ethics and is subject to institutional review.'
  },
  {
    id: 'policy-privacy',
    title: '2. Exam Proctoring & Video Recording Privacy',
    icon: <Eye className="policy-icon" />,
    text: 'Camera recordings captured during Practical Exam Mode are stored strictly for institutional evaluation and academic verification. Video streams are captured in isolated browser storage (IndexedDB) and only transmitted to authorized institutional evaluators. Feeds are never sold, published, or utilized for commercial purposes.'
  },
  {
    id: 'policy-safety',
    title: '3. Virtual Laboratory Standards & Shodhana Safety',
    icon: <ShieldCheck className="policy-icon" />,
    text: 'Formulations involving hazardous or poisonous raw herbs/minerals (Visha / Upavisha Dravyas such as Vatsanabha, Parada, Gandhaka, and Vishamusti) must strictly simulate prior Shodhana (purification) processes. The Virtual Lab replicates classical texts (Bhaishajya Ratnavali, Sharangadhara Samhita, Rasa Tarangini) to instill real-world Ayurvedic pharmaceutical safety.'
  },
  {
    id: 'policy-data',
    title: '4. Student Progress & Data Security Policy',
    icon: <Lock className="policy-icon" />,
    text: 'User profile information, formulation history, exam grades, and interactive session logs are encrypted. Users have the right to request review of their stored laboratory records through their designated faculty administrator.'
  },
  {
    id: 'policy-terms',
    title: '5. Terms of Educational Platform Use',
    icon: <HeartHandshake className="policy-icon" />,
    text: 'The AI Ayurveda Virtual Lab is engineered exclusively for educational, instructional, and research training for BAMS scholars, pharmacists, and practitioners. Simulation results and virtual dosages are educational simulations and do not substitute for certified clinical physician diagnosis or prescription.'
  }
];

const Help = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState('faq-1');
  const [activeTab, setActiveTab] = useState('faqs'); // 'faqs' | 'policies'

  const filteredFaqs = useMemo(() => {
    if (!searchQuery.trim()) return FAQS;
    const q = searchQuery.toLowerCase();
    return FAQS.filter(f => 
      f.question.toLowerCase().includes(q) || 
      f.category.toLowerCase().includes(q) || 
      f.summary.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const filteredPolicies = useMemo(() => {
    if (!searchQuery.trim()) return POLICIES;
    const q = searchQuery.toLowerCase();
    return POLICIES.filter(p => 
      p.title.toLowerCase().includes(q) || 
      p.text.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  const toggleFaq = (id) => {
    setOpenFaqId(prev => prev === id ? null : id);
  };

  return (
    <div className="help-page-container">
      {/* Back navigation */}
      <div className="help-top-nav">
        <button className="help-back-btn" onClick={() => navigate('/dashboard')}>
          <ArrowLeft size={16} /> Back to Dashboard
        </button>
      </div>

      {/* Hero Header */}
      <div className="help-hero glass-panel">
        <div className="help-hero-badge">
          <HelpCircle size={16} /> Knowledge Base & Laboratory Guidelines
        </div>
        <h1 className="help-hero-title">Platform Help & Policies Center</h1>
        <p className="help-hero-sub">
          Everything you need to master the virtual pharmacy: experiment workflows, ratio formulas, exam proctoring protocols, and institutional policies.
        </p>

        {/* Search Bar */}
        <div className="help-search-container">
          <Search size={18} className="help-search-icon" />
          <input 
            type="text" 
            className="help-search-input"
            placeholder="Search questions, ratios, exam rules, or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="help-search-clear" onClick={() => setSearchQuery('')}>×</button>
          )}
        </div>

        {/* Category switcher */}
        <div className="help-tabs-row">
          <button 
            className={`help-tab-btn ${activeTab === 'faqs' ? 'active' : ''}`}
            onClick={() => setActiveTab('faqs')}
          >
            <BookOpen size={16} /> Core Practical FAQs ({filteredFaqs.length})
          </button>
          <button 
            className={`help-tab-btn ${activeTab === 'policies' ? 'active' : ''}`}
            onClick={() => setActiveTab('policies')}
          >
            <FileText size={16} /> Platform Policies & Ethics ({filteredPolicies.length})
          </button>
        </div>
      </div>

      {/* Quick Stat Cards */}
      <div className="help-quick-cards-grid">
        <div className="quick-card glass-panel" onClick={() => { setActiveTab('faqs'); setOpenFaqId('faq-1'); }}>
          <div className="qc-icon green"><FlaskConical size={22} /></div>
          <div>
            <h4>Practical Mode Guide</h4>
            <p>How to drag, measure, and formulate compounds</p>
          </div>
        </div>

        <div className="quick-card glass-panel" onClick={() => { setActiveTab('faqs'); setOpenFaqId('faq-2'); }}>
          <div className="qc-icon amber"><Scale size={22} /></div>
          <div>
            <h4>Ratio Calculation</h4>
            <p>Master proportions and prevent destroyed batches</p>
          </div>
        </div>

        <div className="quick-card glass-panel" onClick={() => { setActiveTab('faqs'); setOpenFaqId('faq-3'); }}>
          <div className="qc-icon blue"><ShieldCheck size={22} /></div>
          <div>
            <h4>Exam Proctoring</h4>
            <p>Background video monitoring and locked testing rules</p>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="help-content-section">
        {activeTab === 'faqs' && (
          <div className="faq-section">
            <div className="section-header-row">
              <h2>Essential Practical FAQs</h2>
              <span className="section-count">{filteredFaqs.length} Questions</span>
            </div>

            {filteredFaqs.length === 0 ? (
              <div className="no-results-box glass-panel">
                <Search size={32} />
                <p>No matching questions found for "{searchQuery}".</p>
                <button className="btn-outline" onClick={() => setSearchQuery('')}>Clear Search</button>
              </div>
            ) : (
              <div className="faqs-accordion-list">
                {filteredFaqs.map(faq => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div key={faq.id} className={`faq-card glass-panel ${isOpen ? 'open' : ''}`}>
                      <div className="faq-header" onClick={() => toggleFaq(faq.id)}>
                        <div className="faq-title-wrap">
                          <span className="faq-category-tag">{faq.category}</span>
                          <h3 className="faq-question">{faq.question}</h3>
                          <p className="faq-summary">{faq.summary}</p>
                        </div>
                        <div className="faq-toggle-icon">
                          {isOpen ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                        </div>
                      </div>

                      {isOpen && (
                        <div className="faq-body">
                          {faq.content}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'policies' && (
          <div className="policies-section">
            <div className="section-header-row">
              <h2>Laboratory Standards & Platform Policies</h2>
              <span className="section-count">{filteredPolicies.length} Policies</span>
            </div>

            {filteredPolicies.length === 0 ? (
              <div className="no-results-box glass-panel">
                <Search size={32} />
                <p>No matching policies found for "{searchQuery}".</p>
                <button className="btn-outline" onClick={() => setSearchQuery('')}>Clear Search</button>
              </div>
            ) : (
              <div className="policies-list">
                {filteredPolicies.map(policy => (
                  <div key={policy.id} className="policy-card glass-panel">
                    <div className="policy-card-header">
                      {policy.icon}
                      <h3>{policy.title}</h3>
                    </div>
                    <p className="policy-card-text">{policy.text}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Assistance Banner */}
      <div className="help-footer-banner glass-panel">
        <div className="hfb-left">
          <Bot size={28} className="hfb-icon" />
          <div>
            <h3>Need Live Academic Assistance?</h3>
            <p>Open the <strong>AI Ayurvedic Tutor</strong> inside the Learning Library anytime for real-time shloka interpretation and formulation advice.</p>
          </div>
        </div>
        <div className="hfb-actions">
          <Link to="/learning" className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <BookOpen size={16} /> Open E-Library
          </Link>
          <Link to="/practical" className="btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }}>
            <FlaskConical size={16} /> Go to Practical Lab
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Help;
