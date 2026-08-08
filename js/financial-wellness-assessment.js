// Financial Wellness Assessment — Iberian Pacific Financial Services
// CFP-aligned scoring across 5 financial wellness dimensions

const sections = [
  {
    id: 'cashflow', title: 'Cash Flow & Budgeting', color: '#6B2737',
    description: "We'll start by looking at how you manage your day-to-day money — the foundation of all financial wellness.",
    questions: [
      {
        text: 'How often do you actively track your income and spending?',
        options: [
          { text: 'Never — I avoid looking at my finances', score: 0 },
          { text: "Rarely, only when I'm worried about money", score: 1 },
          { text: 'Sometimes — maybe once a month or less', score: 2 },
          { text: 'Most months, though not perfectly consistently', score: 3 },
          { text: 'Every week or more — I have a solid system', score: 4 }
        ]
      },
      {
        text: 'Do you have a written or digital budget that you actively use?',
        options: [
          { text: 'No — I just try not to overspend', score: 0 },
          { text: 'I have a rough idea in my head but nothing formal', score: 1 },
          { text: "I've made one but I rarely look at it", score: 2 },
          { text: 'I have a budget and check it occasionally', score: 3 },
          { text: 'Yes — I follow an active, up-to-date budget', score: 4 }
        ]
      },
      {
        text: 'How much do you have in an emergency fund (money set aside for unexpected costs)?',
        options: [
          { text: 'Nothing — I have no savings at all', score: 0 },
          { text: 'Less than $1,000', score: 1 },
          { text: '$1,000–$5,000', score: 2 },
          { text: '1–2 months of living expenses', score: 3 },
          { text: '3 or more months of living expenses', score: 4 }
        ]
      },
      {
        text: 'After covering all your monthly expenses, how often do you have money left over?',
        options: [
          { text: 'I regularly go into overdraft or debt just to get by', score: 0 },
          { text: 'I almost always come up short', score: 1 },
          { text: "It's 50/50 — some months yes, some no", score: 2 },
          { text: 'I usually have a little left but it varies', score: 3 },
          { text: 'I consistently have money left to save or invest', score: 4 }
        ]
      },
      {
        text: 'If a surprise $1,000 expense came up today, how would you handle it?',
        options: [
          { text: "I'd need to skip essentials (bills, groceries) to cover it", score: 0 },
          { text: "I'd borrow from family or friends", score: 1 },
          { text: "I'd put it on a credit card and carry the balance", score: 2 },
          { text: "I'd cover it, but my budget would feel tight this month", score: 3 },
          { text: "I'd cover it comfortably from my emergency savings", score: 4 }
        ]
      }
    ]
  },
  {
    id: 'debt', title: 'Debt & Credit', color: '#A8562F',
    description: "Understanding your debt and credit health is critical for long-term financial stability. Let's see where you stand.",
    questions: [
      {
        text: 'Do you know your current credit score?',
        options: [
          { text: "No idea — I've never checked", score: 0 },
          { text: "I know credit scores exist, but I don't know mine", score: 1 },
          { text: "I've checked once or twice but don't monitor it", score: 2 },
          { text: 'I checked within the last 6 months', score: 3 },
          { text: 'I check it regularly and understand what affects it', score: 4 }
        ]
      },
      {
        text: 'How do you typically manage your credit card balance?',
        options: [
          { text: 'I carry a large balance and only pay the minimum', score: 0 },
          { text: 'I carry a balance most months', score: 1 },
          { text: 'I sometimes carry a balance when money is tight', score: 2 },
          { text: 'I usually pay it off; occasionally carry a small balance', score: 3 },
          { text: 'I always pay the full balance before the due date', score: 4 }
        ]
      },
      {
        text: 'How comfortable are you with your current total debt situation?',
        options: [
          { text: "I feel completely overwhelmed — I don't see a way out", score: 0 },
          { text: "I'm very stressed and avoid thinking about it", score: 1 },
          { text: "I'm a bit worried but think I'll figure it out", score: 2 },
          { text: "I'm managing — I have a rough plan in place", score: 3 },
          { text: 'I feel in control with a clear repayment strategy', score: 4 }
        ]
      },
      {
        text: 'Do you know the exact interest rates on your loans, lines of credit, or credit cards?',
        options: [
          { text: 'No idea — I try not to think about it', score: 0 },
          { text: 'I know rates exist but not the specific numbers', score: 1 },
          { text: 'I know the general range but not exactly', score: 2 },
          { text: "I know my rates but haven't calculated total interest costs", score: 3 },
          { text: "I know all rates and have calculated exactly what they're costing me", score: 4 }
        ]
      },
      {
        text: 'How are you handling repayment of your largest debt (mortgage, line of credit, or loan)?',
        options: [
          { text: "I'm behind or struggling to keep up with payments", score: 0 },
          { text: "I'm making the minimum payments and nothing more", score: 1 },
          { text: 'I make regular payments as scheduled', score: 2 },
          { text: "I make extra payments when I can, but don't have a formal strategy", score: 3 },
          { text: "I'm paying it down with a deliberate acceleration strategy", score: 4 }
        ]
      }
    ]
  },
  {
    id: 'savings', title: 'Savings & Investing', color: '#C9A84C',
    description: "Saving and investing are how you build wealth over time. We'll also assess your risk tolerance to identify your investor profile.",
    questions: [
      {
        text: 'Do you have a TFSA (Tax-Free Savings Account)?',
        options: [
          { text: "No — I don't know what that is", score: 0 },
          { text: "I know what a TFSA is, but haven't opened one", score: 1 },
          { text: 'I plan to open one soon', score: 2 },
          { text: 'Yes, but I contribute to it irregularly', score: 3 },
          { text: 'Yes — I contribute regularly and understand the limits', score: 4 }
        ]
      },
      {
        text: 'If you received $5,000 unexpectedly today (tax refund, bonus, inheritance), what would you most likely do?',
        options: [
          { text: 'Spend most or all of it on things I want or need', score: 0 },
          { text: 'Use it to pay off my most stressful debt', score: 1 },
          { text: 'Split it between paying debt and adding to savings', score: 2 },
          { text: 'Put most into my TFSA or savings account', score: 3 },
          { text: 'Invest it all in a diversified portfolio for long-term growth', score: 4 }
        ]
      },
      {
        text: 'You invest $20,000 and after 6 months it drops to $14,000 (a 30% loss). What do you do?',
        options: [
          { text: 'Sell everything immediately — losing money is unacceptable to me', score: 0 },
          { text: 'Sell most of it and keep a small amount invested, just in case', score: 1 },
          { text: "Hold on, but I'd be very stressed and checking daily", score: 2 },
          { text: 'Hold on — I know markets fluctuate and I trust the long term', score: 3 },
          { text: "Buy more — I see it as a discount and a long-term opportunity", score: 4 }
        ]
      },
      {
        text: 'Which best describes your primary investment goal?',
        options: [
          { text: 'Protect my money above all — even if returns are low or zero', score: 0 },
          { text: 'Earn modest, steady returns with minimal risk', score: 1 },
          { text: 'Balanced growth — some ups and downs are okay', score: 2 },
          { text: 'Strong growth — I can handle significant ups and downs', score: 3 },
          { text: 'Maximum long-term growth — I can handle major market swings', score: 4 }
        ]
      },
      {
        text: 'When do you expect to need your savings or investments?',
        options: [
          { text: 'I might need this money at any time', score: 0 },
          { text: 'Within the next 1–2 years', score: 1 },
          { text: 'Within 2–5 years', score: 2 },
          { text: 'In 5–10 years', score: 3 },
          { text: 'More than 10 years from now', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'goals', title: 'Financial Goals & Planning', color: '#3D5A6C',
    description: "Good financial planning means setting clear goals and a roadmap to reach them. Let's explore how future-focused your financial thinking is.",
    questions: [
      {
        text: 'Do you have clearly defined financial goals?',
        options: [
          { text: "No — I haven't thought seriously about financial goals", score: 0 },
          { text: 'I have vague ideas but nothing specific', score: 1 },
          { text: "I have goals in mind but they're not written down", score: 2 },
          { text: 'I have written goals but no concrete action plan', score: 3 },
          { text: 'I have SMART goals (specific, time-bound) with steps to reach them', score: 4 }
        ]
      },
      {
        text: "How well do you understand Canada's retirement income landscape (CPP, OAS, RRSP)?",
        options: [
          { text: 'Not at all — retirement feels far away and overwhelming', score: 0 },
          { text: "I know they exist but don't understand how they work", score: 1 },
          { text: 'I have a basic understanding of one or two of these', score: 2 },
          { text: "I understand all three and have thought about how they'll apply to me", score: 3 },
          { text: 'I understand them well and have a retirement plan that integrates all three', score: 4 }
        ]
      },
      {
        text: 'Do you have any of the following in place? (life insurance, disability insurance, or an up-to-date will/estate plan)',
        options: [
          { text: 'None of the above', score: 0 },
          { text: "I've thought about it but haven't done anything yet", score: 1 },
          { text: 'I have one of these in place', score: 2 },
          { text: 'I have two or more of these in place', score: 3 },
          { text: 'I have comprehensive coverage and an up-to-date estate plan', score: 4 }
        ]
      },
      {
        text: 'When you picture your finances 5 years from now, what do you see?',
        options: [
          { text: "I try not to think about it — it's too stressful or uncertain", score: 0 },
          { text: 'I hope things will be better but I have no specific vision', score: 1 },
          { text: "I see myself more stable but I'm not sure how to get there", score: 2 },
          { text: 'I have a clear vision and am starting to take concrete steps', score: 3 },
          { text: 'I have a detailed plan and am actively working toward specific milestones', score: 4 }
        ]
      },
      {
        text: 'How proactively do you seek out financial education or professional advice?',
        options: [
          { text: "I don't — financial topics feel overwhelming or not relevant yet", score: 0 },
          { text: 'Rarely — only when a financial crisis forces me to', score: 1 },
          { text: 'Occasionally — when something specific comes up', score: 2 },
          { text: 'Regularly — I read articles, listen to podcasts, or take courses', score: 3 },
          { text: 'Actively — I have an advisor and stay on top of new information', score: 4 }
        ]
      }
    ]
  },
  {
    id: 'mindset', title: 'Money Mindset & Wellness', color: '#6B4E71',
    description: "Money stress is one of the most common (and least discussed) barriers to a good life. This section explores your emotional relationship with money — just as important as the numbers.",
    questions: [
      {
        text: 'How often does thinking about money cause you noticeable stress or anxiety?',
        options: [
          { text: 'Almost constantly — it significantly affects my daily life', score: 0 },
          { text: 'Very often — several times a week at least', score: 1 },
          { text: 'Occasionally — maybe a few times a month', score: 2 },
          { text: 'Rarely — I feel generally okay about my finances', score: 3 },
          { text: 'Almost never — I feel calm and in control', score: 4 }
        ]
      },
      {
        text: 'Do you avoid checking your bank account, opening bills, or looking at financial statements?',
        options: [
          { text: "Yes, almost always — I genuinely can't bring myself to look", score: 0 },
          { text: 'Often — I only check when I absolutely have to', score: 1 },
          { text: 'Sometimes — I procrastinate but eventually do it', score: 2 },
          { text: 'Rarely — I sometimes delay but usually stay on top of it', score: 3 },
          { text: 'Never — I check proactively and feel okay doing so', score: 4 }
        ]
      },
      {
        text: 'Have money issues ever significantly affected your sleep, relationships, or mental health?',
        options: [
          { text: 'Yes — it has been a major source of mental health struggles for me', score: 0 },
          { text: 'Yes — it noticeably affects my relationships or sleep regularly', score: 1 },
          { text: 'Sometimes — it occasionally impacts my mood or ability to focus', score: 2 },
          { text: "Rarely — I've had moments but generally manage it okay", score: 3 },
          { text: "No — I manage financial stress well and it doesn't bleed into other areas", score: 4 }
        ]
      },
      {
        text: 'When financial stress hits, how do you typically cope?',
        options: [
          { text: 'I shut down, avoid everything, or feel completely paralyzed', score: 0 },
          { text: 'I worry about it but rarely take any concrete action', score: 1 },
          { text: "I try to distract myself — it doesn't really help", score: 2 },
          { text: 'I talk to someone I trust or research what I can do', score: 3 },
          { text: 'I take concrete action and have healthy coping strategies that work for me', score: 4 }
        ]
      },
      {
        text: 'How do you feel about discussing money or asking for financial help?',
        options: [
          { text: 'I feel a lot of shame around money and would never discuss it', score: 0 },
          { text: "It feels too personal or embarrassing — I rarely bring it up", score: 1 },
          { text: "I sometimes talk about it with close friends or family but it's uncomfortable", score: 2 },
          { text: "I'm fairly open about money and wouldn't hesitate to ask for help", score: 3 },
          { text: 'I actively normalize money conversations and know when to seek professional advice', score: 4 }
        ]
      }
    ]
  }
];

const wellnessLevels = [
  {
    min: 0, max: 30, label: 'Financial Distress', color: '#A8562F', bg: '#FBF1EC',
    description: "You're in a genuinely challenging place right now — and acknowledging that takes real courage. The financial stress you're feeling is valid and completely understandable. This is exactly where a judgment-free conversation with a professional can make the biggest difference. You don't have to figure this out alone, and you don't need to have it all together before reaching out."
  },
  {
    min: 31, max: 50, label: 'Financial Fragility', color: '#C9A84C', bg: '#FBF6E9',
    description: "Your finances have some real gaps that are creating stress in your day-to-day life. The good news: you're at a stage where a few targeted, consistent changes can build meaningful stability relatively quickly. You have a foundation to work from — it just needs strengthening. Start with one area at a time, and don't try to fix everything at once."
  },
  {
    min: 51, max: 65, label: 'Financial Stability', color: '#3D5A6C', bg: '#EEF2F4',
    description: "You've built a reasonable financial foundation — you're covering your basics and have some self-awareness about your money. There's significant room to grow, and you may not yet be making the most of key Canadian tools like TFSAs, RRSPs, or optimized debt repayment strategies. With some focused planning, you can move from stability to security."
  },
  {
    min: 66, max: 80, label: 'Financial Security', color: '#4F8267', bg: '#EEF5F1',
    description: "You're in a genuinely strong position. You've developed good money habits and are thinking ahead with real intention. Your next phase is about optimizing — investing more strategically, setting clearer long-term goals, and proactively managing the stress that still shows up. You're building real momentum."
  },
  {
    min: 81, max: 100, label: 'Financial Confidence', color: '#6B2737', bg: '#F5EDEF',
    description: "You demonstrate excellent financial wellness — this is genuinely impressive. You think ahead, manage your money with intention, and have developed healthy habits and perspectives. Your focus now should be on optimizing: maximizing TFSA/RRSP contributions, investing with purpose, and integrating tax, estate, and legacy planning into the picture."
  }
];

const investorTypes = [
  {
    min: 0, max: 4, label: 'The Protector', riskWidth: '12%',
    description: "Above all else, you want to know your money is safe. You'd rather accept lower returns than risk losing what you've worked hard to save. This mindset makes a lot of sense — especially if you're still building financial stability or may need access to your money on short notice. A licensed financial advisor can help you explore whether any growth-oriented options genuinely fit your situation."
  },
  {
    min: 5, max: 8, label: 'The Careful Builder', riskWidth: '32%',
    description: "You're cautious but curious — open to some growth, but not at the expense of your peace of mind. You prefer slow and steady over exciting but unpredictable. You make deliberate decisions and don't take financial risks lightly. That thoughtfulness is genuinely valuable. A licensed financial professional can help you find the right balance between protecting and growing your money."
  },
  {
    min: 9, max: 11, label: 'The Steady Planner', riskWidth: '54%',
    description: "You think long-term and accept that some ups and downs come with the territory. You don't panic when things shift — you stay the course. This calm, measured approach is one of the most powerful qualities a person can develop around money. You're well-positioned to benefit from working with a licensed financial advisor to turn that mindset into a concrete, personalized plan."
  },
  {
    min: 12, max: 14, label: 'The Growth Seeker', riskWidth: '76%',
    description: "You're future-focused and willing to accept short-term discomfort in exchange for stronger long-term results. You understand that building real wealth takes patience and discipline — you're not checking prices daily and you trust the process. Working with a licensed financial professional can help make sure your strategy genuinely matches your risk tolerance, timeline, and life goals."
  },
  {
    min: 15, max: 16, label: 'The Long-Game Player', riskWidth: '96%',
    description: "You think in decades, not months. Market swings don't scare you — you see them as part of the journey, not a reason to change course. Your patience and high comfort with uncertainty are potentially powerful financial traits. That said, this approach needs to genuinely match your real time horizon and financial situation — a licensed advisor can help confirm it does and build accordingly."
  }
];

const tipLibrary = {
  cashflow: {
    low:  { sectionLabel: 'Cash Flow', title: 'Start With a Simple Budget', body: "You don't need a complex system. Start by tracking just your top 5 expenses this week. The awareness alone changes behaviour — and it's the first thing we'll want to understand together.", link: 'contact.html', linkText: 'Talk to an Advisor' },
    mid:  { sectionLabel: 'Cash Flow', title: 'Build Your Emergency Buffer', body: "Even a modest amount set aside changes everything psychologically and practically. A high-interest savings account or short-term GIC is a common place to build this cushion.", link: 'gic-rates.html', linkText: 'See Current GIC Rates' },
    high: { sectionLabel: 'Cash Flow', title: 'Optimize Your Cash Flow System', body: "You're doing great. Consider automating your savings, and revisiting how your surplus cash flow is allocated across investment accounts.", link: 'investment-management.html', linkText: 'Explore Investment Management' }
  },
  debt: {
    low:  { sectionLabel: 'Debt & Credit', title: 'Know What You Owe — Today', body: "The scariest step is writing down every debt with its interest rate. Do it this week, then bring it to a conversation with an advisor who can help you build a realistic repayment plan.", link: 'contact.html', linkText: 'Talk to an Advisor' },
    mid:  { sectionLabel: 'Debt & Credit', title: 'Check Your Credit Score (Free)', body: "Equifax and TransUnion both offer free credit reports in Canada. Knowing your score is the first step to improving it — and it takes less than 5 minutes.", link: 'resources.html', linkText: 'Explore More Resources' },
    high: { sectionLabel: 'Debt & Credit', title: 'Accelerate Your Debt Freedom', body: "You're in control. If a mortgage or major loan is part of the picture, a structured payoff strategy can shave years and thousands in interest off your timeline.", link: 'mortgage-freedom-plan.html', linkText: 'See the Mortgage Freedom Plan' }
  },
  savings: {
    low:  { sectionLabel: 'Savings & Investing', title: 'Open a TFSA This Week', body: "A TFSA is one of the most powerful savings tools available to Canadians. Every year you don't use your contribution room is an opportunity cost you can't recover.", link: 'investment-calculator.html', linkText: 'Compare FHSA / TFSA / RRSP' },
    mid:  { sectionLabel: 'Savings & Investing', title: 'Understand the Power of Compounding', body: "The single biggest driver of long-term growth isn't the size of your contributions — it's how long they've had to compound. Starting now, even modestly, matters more than waiting to start big.", link: 'investment-calculator.html', linkText: 'Model Your Growth' },
    high: { sectionLabel: 'Savings & Investing', title: 'Make the Most of Your Registered Accounts', body: "You're building strong savings habits — now make sure your TFSA, RRSP, and non-registered accounts are working together as efficiently as possible for your tax situation.", link: 'investment-management.html', linkText: 'Explore Investment Management' }
  },
  goals: {
    low:  { sectionLabel: 'Financial Goals', title: 'Set One Clear Financial Goal', body: "Pick one goal — just one — and write it down with a dollar amount and a date. That specificity changes everything, and it's exactly where a first conversation with an advisor is most useful.", link: 'contact.html', linkText: 'Book a Conversation' },
    mid:  { sectionLabel: 'Financial Goals', title: "Learn How CPP, OAS, and RRSPs Work Together", body: "These three pieces work together to fund retirement. The earlier you understand how they fit your specific situation, the more intentionally you can build toward it.", link: 'individuals-families.html', linkText: 'Explore Planning for Individuals & Families' },
    high: { sectionLabel: 'Financial Goals', title: 'Consider Estate & Legacy Planning', body: "As your plan matures, protecting and structuring what you've built matters more. A will, insurance review, and estate plan safeguard everything you're building for the people who matter to you.", link: 'estate-planning.html', linkText: 'Explore Estate & Legacy Planning' }
  },
  mindset: {
    low:  { sectionLabel: 'Money Mindset', title: 'You Don’t Have to Carry This Alone', body: "Money stress at this level is genuinely heavy and can affect everything — sleep, relationships, focus. A complimentary, judgment-free conversation with an advisor is often the first real relief.", link: 'contact.html', linkText: 'Reach Out — No Cost', isMindset: true },
    mid:  { sectionLabel: 'Money Mindset', title: 'Break the Avoidance Cycle', body: "Avoiding financial information increases anxiety rather than reduces it. Try a 10-minute 'money check-in' once a week: just you, your accounts, and no pressure to fix anything — just to look.", link: 'contact.html', linkText: 'Talk to an Advisor', isMindset: true },
    high: { sectionLabel: 'Money Mindset', title: 'Normalize Money Conversations', body: "You have a healthy money mindset. Sharing what works with people in your life is one of the most effective ways to reduce the shame that often surrounds money.", link: 'resources.html', linkText: 'Explore More Resources', isMindset: true }
  }
};

// ── State ──────────────────────────────────────────────────────────
let state = { sectionIndex: 0, questionIndex: 0, answers: [] };

function initAnswers() {
  state.answers = sections.map(s => Array(s.questions.length).fill(null));
}

// ── Init ───────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initAnswers();
  document.getElementById('start-btn').addEventListener('click', startAssessment);
  document.getElementById('begin-section-btn').addEventListener('click', beginSection);
  document.getElementById('next-btn').addEventListener('click', nextQuestion);
  document.getElementById('prev-btn').addEventListener('click', prevQuestion);
  document.getElementById('retake-btn').addEventListener('click', retakeAssessment);

  const shareCheckbox = document.getElementById('results-share-category');
  if (shareCheckbox) {
    shareCheckbox.addEventListener('change', function () {
      const field = document.getElementById('nl-assessment-result');
      if (!field) return;
      if (this.checked) {
        const { overall } = calculateScores();
        field.value = getWellnessLevel(overall).label;
      } else {
        field.value = '';
      }
    });
  }
});

// ── Screen management ──────────────────────────────────────────────
function showScreen(id) {
  document.querySelectorAll('.assessment-screen').forEach(s => s.classList.remove('active'));
  const el = document.getElementById(id);
  if (el) el.classList.add('active');
  const anchor = document.getElementById('assessment-anchor');
  if (anchor) anchor.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// ── Navigation ─────────────────────────────────────────────────────
function startAssessment() {
  state.sectionIndex = 0;
  state.questionIndex = 0;
  renderSectionIntro();
}

function beginSection() {
  state.questionIndex = 0;
  renderQuestion();
}

function nextQuestion() {
  const btn = document.getElementById('next-btn');
  if (!btn.classList.contains('enabled')) return;
  const section = sections[state.sectionIndex];
  if (state.questionIndex < section.questions.length - 1) {
    state.questionIndex++;
    renderQuestion();
  } else if (state.sectionIndex < sections.length - 1) {
    state.sectionIndex++;
    renderSectionIntro();
  } else {
    renderResults();
  }
}

function prevQuestion() {
  if (state.questionIndex > 0) {
    state.questionIndex--;
    renderQuestion();
  } else if (state.sectionIndex > 0) {
    state.sectionIndex--;
    state.questionIndex = sections[state.sectionIndex].questions.length - 1;
    renderQuestion();
  } else {
    renderSectionIntro();
  }
}

function retakeAssessment() {
  initAnswers();
  state.sectionIndex = 0;
  state.questionIndex = 0;
  resetStepper();
  showScreen('screen-intro');
}

// ── Stepper ────────────────────────────────────────────────────────
function updateStepper(currentSection) {
  for (let i = 0; i < sections.length; i++) {
    const circle = document.getElementById(`step-${i}`);
    const label  = document.getElementById(`step-label-${i}`);
    const conn   = document.getElementById(`connector-${i}`);
    if (!circle) continue;
    circle.classList.remove('active', 'completed');
    if (label) label.classList.remove('active', 'completed');
    if (i < currentSection) {
      circle.classList.add('completed');
      circle.textContent = '✓';
      if (label) label.classList.add('completed');
      if (conn) conn.classList.add('completed');
    } else if (i === currentSection) {
      circle.classList.add('active');
      circle.textContent = i + 1;
      if (label) label.classList.add('active');
    } else {
      circle.textContent = i + 1;
      if (conn) conn.classList.remove('completed');
    }
  }
}

function resetStepper() {
  for (let i = 0; i < sections.length; i++) {
    const circle = document.getElementById(`step-${i}`);
    const label  = document.getElementById(`step-label-${i}`);
    const conn   = document.getElementById(`connector-${i}`);
    if (circle) { circle.classList.remove('active', 'completed'); circle.textContent = i + 1; }
    if (label)  label.classList.remove('active', 'completed');
    if (conn)   conn.classList.remove('completed');
  }
}

// ── Section Intro ──────────────────────────────────────────────────
function renderSectionIntro() {
  const s = sections[state.sectionIndex];
  document.getElementById('si-badge').textContent       = `Section ${state.sectionIndex + 1} of ${sections.length}`;
  document.getElementById('si-title').textContent       = s.title;
  document.getElementById('si-description').textContent = s.description;
  updateStepper(state.sectionIndex);
  showScreen('screen-section-intro');
}

// ── Question ───────────────────────────────────────────────────────
function renderQuestion() {
  const si = state.sectionIndex;
  const qi = state.questionIndex;
  const section  = sections[si];
  const question = section.questions[qi];

  document.getElementById('q-section-badge').textContent = section.title;
  document.getElementById('q-counter').textContent       = `Question ${qi + 1} of ${section.questions.length}`;
  document.getElementById('q-progress-fill').style.width = `${(qi / section.questions.length) * 100}%`;
  document.getElementById('q-text').textContent          = question.text;

  const optionsList = document.getElementById('q-options');
  optionsList.innerHTML = '';
  const letters = ['A', 'B', 'C', 'D', 'E'];
  const saved   = state.answers[si][qi];

  question.options.forEach((opt, idx) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn' + (saved !== null && saved.optionIndex === idx ? ' selected' : '');
    btn.innerHTML = `<span class="option-letter">${letters[idx]}</span><span>${opt.text}</span>`;
    btn.addEventListener('click', () => selectOption(idx, opt.score));
    optionsList.appendChild(btn);
  });

  const nextBtn = document.getElementById('next-btn');
  const isLastQ = qi === section.questions.length - 1;
  const isLastS = si === sections.length - 1;

  if (saved !== null) {
    nextBtn.classList.add('enabled');
    nextBtn.textContent = isLastQ && isLastS ? 'See My Results →' : isLastQ ? 'Next Section →' : 'Continue →';
  } else {
    nextBtn.classList.remove('enabled');
    nextBtn.textContent = 'Continue →';
  }

  const prevBtn = document.getElementById('prev-btn');
  prevBtn.style.visibility = (si === 0 && qi === 0) ? 'hidden' : 'visible';

  updateStepper(si);
  showScreen('screen-question');
}

function selectOption(optionIndex, score) {
  const si = state.sectionIndex;
  const qi = state.questionIndex;
  state.answers[si][qi] = { optionIndex, score };

  document.querySelectorAll('.option-btn').forEach((btn, idx) => {
    btn.classList.toggle('selected', idx === optionIndex);
  });

  const nextBtn = document.getElementById('next-btn');
  nextBtn.classList.add('enabled');
  const isLastQ = qi === sections[si].questions.length - 1;
  const isLastS = si === sections.length - 1;
  nextBtn.textContent = isLastQ && isLastS ? 'See My Results →' : isLastQ ? 'Next Section →' : 'Continue →';
}

// ── Scoring ────────────────────────────────────────────────────────
function calculateScores() {
  const sectionScores = sections.map((section, si) => {
    const score = section.questions.reduce((sum, _, qi) => {
      const ans = state.answers[si][qi];
      return sum + (ans ? ans.score : 0);
    }, 0);
    const maxScore = section.questions.length * 4;
    return { id: section.id, title: section.title, color: section.color, score, maxScore, percentage: Math.round((score / maxScore) * 100) };
  });

  const totalScore = sectionScores.reduce((sum, s) => sum + s.score, 0);
  const maxTotal   = sections.reduce((sum, s) => sum + s.questions.length * 4, 0);
  const overall    = Math.round((totalScore / maxTotal) * 100);

  // Risk tolerance: section 3 (savings), questions 1–4 (skip TFSA knowledge q at index 0)
  const riskScore  = [1, 2, 3, 4].reduce((sum, qi) => {
    const ans = state.answers[2][qi];
    return sum + (ans ? ans.score : 0);
  }, 0);

  return { sectionScores, overall, riskScore };
}

function getWellnessLevel(pct) {
  return wellnessLevels.find(l => pct >= l.min && pct <= l.max) || wellnessLevels[0];
}

function getInvestorType(riskScore) {
  return investorTypes.find(t => riskScore >= t.min && riskScore <= t.max) || investorTypes[2];
}

function generateTips(sectionScores) {
  const tips = [];
  const sorted = [...sectionScores].sort((a, b) => a.percentage - b.percentage);

  sorted.slice(0, 4).forEach(section => {
    const lib = tipLibrary[section.id];
    if (!lib) return;
    const key = section.percentage < 40 ? 'low' : section.percentage < 70 ? 'mid' : 'high';
    tips.push({ ...lib[key], isMindset: section.id === 'mindset' });
  });

  // Always include mindset tip if mindset is below 50 and not already in tips
  const mindsetSec = sectionScores.find(s => s.id === 'mindset');
  if (mindsetSec && mindsetSec.percentage < 50 && !tips.some(t => t.isMindset)) {
    const key = mindsetSec.percentage < 30 ? 'low' : 'mid';
    tips.push({ ...tipLibrary.mindset[key], isMindset: true });
  }

  return tips.slice(0, 4);
}

// ── Results ────────────────────────────────────────────────────────
function renderResults() {
  const { sectionScores, overall, riskScore } = calculateScores();
  const wellness    = getWellnessLevel(overall);
  const investor    = getInvestorType(riskScore);
  const mindsetData = sectionScores.find(s => s.id === 'mindset');
  const mindsetPct  = mindsetData ? mindsetData.percentage : 0;

  // Wellness badge
  const badge = document.getElementById('wellness-badge');
  badge.textContent        = wellness.label;
  badge.style.background   = wellness.bg;
  badge.style.color        = wellness.color;

  // Score ring
  const circumference = 2 * Math.PI * 80;
  const ringFill = document.getElementById('score-ring-fill');
  ringFill.style.stroke          = wellness.color;
  ringFill.style.strokeDasharray = circumference;
  ringFill.style.strokeDashoffset = circumference;

  const scoreEl = document.getElementById('score-number');
  scoreEl.textContent = '0';

  // Investor profile
  document.getElementById('investor-type-name').textContent   = investor.label;
  document.getElementById('investor-description').textContent = investor.description;
  document.getElementById('risk-meter-fill').style.width = '0%';
  document.getElementById('investor-edu-disclaimer').textContent =
    'Any investment-related terms used here are for general educational awareness only and do not constitute investment advice. Please consult a licensed financial advisor or portfolio manager before making any investment decisions.';

  // Strengths — highest-scoring area(s)
  const strengthsList = document.getElementById('strengths-list');
  if (strengthsList) {
    strengthsList.innerHTML = '';
    const bySc = [...sectionScores].sort((a, b) => b.percentage - a.percentage);
    const strong = bySc.filter(s => s.percentage >= 60).slice(0, 3);
    (strong.length ? strong : [bySc[0]]).forEach(s => {
      strengthsList.insertAdjacentHTML('beforeend', `<span class="strength-pill">${s.title}</span>`);
    });
  }

  // Section bars
  const barsContainer = document.getElementById('section-bars');
  barsContainer.innerHTML = '';
  sectionScores.forEach(s => {
    barsContainer.insertAdjacentHTML('beforeend', `
      <div class="section-bar-item">
        <div class="section-bar-header">
          <span class="section-bar-name">${s.title}</span>
          <span class="section-bar-score">${s.score}/${s.maxScore}</span>
        </div>
        <div class="section-bar-track">
          <div class="section-bar-fill" data-width="${s.percentage}" style="background:${s.color};"></div>
        </div>
      </div>`);
  });

  // Mindset card
  let mindsetLevel, mindsetDesc;
  if (mindsetPct < 30) {
    mindsetLevel = 'High Financial Stress';
    mindsetDesc  = "Your results suggest significant money-related stress that is affecting your day-to-day life. This is more common than you might think — and it is something you can work through. Please consider speaking with a professional or booking a complimentary conversation with our team. You deserve real support, not just financial advice.";
  } else if (mindsetPct < 50) {
    mindsetLevel = 'Moderate Financial Stress';
    mindsetDesc  = "You're experiencing a meaningful level of financial anxiety that occasionally bleeds into other areas of your life. The number one antidote to financial anxiety is clarity — building even a basic picture of your finances tends to reduce stress significantly within weeks.";
  } else if (mindsetPct < 70) {
    mindsetLevel = 'Mild Financial Stress';
    mindsetDesc  = "You manage money stress reasonably well most of the time, though it still shows up occasionally. Small, regular financial check-ins can help you feel more in control and prevent stress from building up.";
  } else {
    mindsetLevel = 'Healthy Money Mindset';
    mindsetDesc  = "You demonstrate a genuinely healthy relationship with money and financial stress. You're open, proactive rather than avoidant, and have good coping strategies. This mindset is a massive advantage — it lets you take action when money gets hard instead of shutting down.";
  }

  document.getElementById('mindset-level-badge').textContent  = mindsetLevel;
  document.getElementById('mindset-description').textContent  = mindsetDesc;
  document.getElementById('mindset-score-fill').style.width   = '0%';

  // Wellness level box
  document.getElementById('wellness-level-title').textContent = `You're at: ${wellness.label}`;
  document.getElementById('wellness-description').textContent = wellness.description;

  // Tips
  const tips = generateTips(sectionScores);
  const tipsGrid = document.getElementById('tips-grid');
  tipsGrid.innerHTML = '';
  tips.forEach(tip => {
    tipsGrid.insertAdjacentHTML('beforeend', `
      <div class="tip-card ${tip.isMindset ? 'mindset' : ''}">
        <span class="tip-section-label">${tip.sectionLabel}</span>
        <h4>${tip.title}</h4>
        <p>${tip.body}</p>
        <a href="${tip.link}">${tip.linkText} →</a>
      </div>`);
  });

  // Show screen
  showScreen('screen-results');

  // Mark all steps complete
  for (let i = 0; i < sections.length; i++) {
    const circle = document.getElementById(`step-${i}`);
    const label  = document.getElementById(`step-label-${i}`);
    const conn   = document.getElementById(`connector-${i}`);
    if (circle) { circle.classList.add('completed'); circle.textContent = '✓'; }
    if (label)  label.classList.add('completed');
    if (conn)   conn.classList.add('completed');
  }

  // Animate
  requestAnimationFrame(() => {
    setTimeout(() => {
      ringFill.style.strokeDashoffset = circumference - (overall / 100) * circumference;
      animateNumber(scoreEl, 0, overall, 1400);
      document.getElementById('risk-meter-fill').style.width = investor.riskWidth;
      document.querySelectorAll('.section-bar-fill').forEach(bar => {
        bar.style.width = bar.getAttribute('data-width') + '%';
      });
      document.getElementById('mindset-score-fill').style.width = mindsetPct + '%';
    }, 120);
  });
}

function animateNumber(el, start, end, duration) {
  const t0 = performance.now();
  function tick(now) {
    const p = Math.min((now - t0) / duration, 1);
    el.textContent = Math.round(start + (end - start) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
}
