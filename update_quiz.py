#!/usr/bin/env python3

# Read the script.js file
with open('script.js', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace level 4
level4_old = '''  {
    id: 4,
    name: "Valuation",
    xpRequired: 350,
    description: "Learn how to compare prices and determine whether a stock is expensive or fairly valued.",
    lesson: "Valuation compares a company's price to its earnings, growth, and assets. A lower price relative to value can mean better value.",
    question: "Why do investors look at valuation ratios like P/E?",
    options: [
      "To see how much investors are paying for each rupee of earnings",
      "To predict the weather",
      "To decide office locations",
      "To count company employees"
    ],
    correctIndex: 0,
    xpReward: 90
  },'''

level4_new = '''  {
    id: 4,
    name: "Valuation",
    xpRequired: 350,
    description: "Learn how to compare prices and determine whether a stock is expensive or fairly valued.",
    lesson: "Valuation compares a company's price to its earnings, growth, and assets. A lower price relative to value can mean better value.",
    xpReward: 90,
    questions: [
      { id: 1, question: "What does valuation attempt to determine?", options: ["How popular a company is", "What a company or stock may be worth", "How many employees a company has", "How much cash investors have"], correctIndex: 1 },
      { id: 2, question: "What does the P/E ratio compare?", options: ["Profit and expenses", "Share price and earnings per share", "Assets and liabilities", "Revenue and cash flow"], correctIndex: 1 },
      { id: 3, question: "If two companies have similar earnings but one has a much higher P/E ratio, what might that suggest?", options: ["Investors are paying more for each unit of its earnings", "The company has no earnings", "Its stock price cannot fall", "The companies have identical valuations"], correctIndex: 0 },
      { id: 4, question: "Why shouldn't investors rely on a single valuation metric?", options: ["Every metric is always incorrect", "Different metrics provide different perspectives", "Valuation doesn't matter", "Stock prices never change"], correctIndex: 1 },
      { id: 5, question: "A stock trading below an estimate of its intrinsic value might be described as:", options: ["Potentially undervalued", "Guaranteed to rise", "Overvalued", "Risk-free"], correctIndex: 0 }
    ]
  },'''

content = content.replace(level4_old, level4_new)

# Replace level 5
level5_old = '''  {
    id: 5,
    name: "Portfolio Management",
    xpRequired: 500,
    description: "Build diversification, balance risk, and create a more resilient portfolio.",
    lesson: "A good portfolio spreads risk across sectors and asset types, instead of betting everything on one stock.",
    question: "Why is diversification useful?",
    options: [
      "It reduces the impact of any single bad investment",
      "It guarantees profit",
      "It removes all market risk",
      "It always lowers taxes"
    ],
    correctIndex: 0,
    xpReward: 120
  }
];'''

level5_new = '''  {
    id: 5,
    name: "Portfolio Management",
    xpRequired: 500,
    description: "Build diversification, balance risk, and create a more resilient portfolio.",
    lesson: "A good portfolio spreads risk across sectors and asset types, instead of betting everything on one stock.",
    xpReward: 120,
    questions: [
      { id: 1, question: "What is diversification?", options: ["Putting all your money into one company", "Spreading investments across different assets or companies", "Buying only technology stocks", "Selling everything when prices fall"], correctIndex: 1 },
      { id: 2, question: "Why can diversification reduce risk?", options: ["Different investments may not all perform the same way at the same time", "It guarantees profits", "It eliminates all market risk", "It guarantees that prices will rise"], correctIndex: 0 },
      { id: 3, question: "What is asset allocation?", options: ["Deciding how to distribute investments among different asset classes", "Choosing a company's CEO", "Calculating revenue", "Predicting tomorrow's stock price"], correctIndex: 0 },
      { id: 4, question: "What does rebalancing a portfolio mean?", options: ["Completely selling your portfolio", "Adjusting investments to bring the portfolio back toward its intended allocation", "Buying only the best-performing stock", "Avoiding all investments"], correctIndex: 1 },
      { id: 5, question: "Which portfolio is generally more diversified?", options: ["100% invested in one company", "100% invested in one industry", "Investments spread across different assets and sectors", "100% invested in one stock"], correctIndex: 2 }
    ]
  }
];'''

content = content.replace(level5_old, level5_new)

# Write back
with open('script.js', 'w', encoding='utf-8') as f:
    f.write(content)

print("Quiz levels updated successfully!")
