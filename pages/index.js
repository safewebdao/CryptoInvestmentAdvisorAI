import { useState, useEffect } from 'react';
import Head from 'next/head';
import AdvisorResponse from '../components/AdvisorResponse';
import InvestmentSimulator from '../components/InvestmentSimulator';
import MarketSentimentAnalyzer from '../components/MarketSentimentAnalyzer';
import RiskAssessor from '../components/RiskAssessor';
import Console from '../components/Console';
import { marked } from 'marked';
import WalletConnection from '../components/WalletConnection';
import { useAccount } from 'wagmi';
import { useSession } from 'next-auth/react';
import ExpandableContent from '../components/ExpandableContent';

export default function Home() {
  const [question, setQuestion] = useState('');
  const [riskLevel, setRiskLevel] = useState('balanced');
  const [responses, setResponses] = useState({});
  const [maverickOpinion, setMaverickOpinion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [consensusAdvice, setConsensusAdvice] = useState('');
  const [logs, setLogs] = useState({});
  const [marketSentiment, setMarketSentiment] = useState(null);
  const { address, isConnected } = useAccount();
  console.log("Wallet connection status:", isConnected);
  const { data: session } = useSession();

  const advisors = [
    { name: 'soros', image: '/images/soros.png' },
    { name: 'buffett', image: '/images/buffett.png' },
    { name: 'dalio', image: '/images/dalio.png' },
    { name: 'wood', image: '/images/Katie_Haun.png' },
  ];

  useEffect(() => {
    console.log("Wallet connection status:", isConnected, "Address:", address);
  }, [isConnected, address]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Submit clicked. isConnected:", isConnected, "address:", address);
    if (!isConnected) {
      open();
      return;
    }
    setIsLoading(true);
    setResponses({});
    setMaverickOpinion('');
    setConsensusAdvice('');
    setLogs({});

    try {
      // Fetch advice from all advisors
      const advisorPromises = advisors.map(advisor => 
        fetch('/api/getAdvice', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question, riskLevel, advisor: advisor.name, marketSentiment }),
        }).then(res => res.json())
      );

      const advisorResults = await Promise.all(advisorPromises);
      const newResponses = {};
      const newLogs = {};
      advisorResults.forEach((result, index) => {
        const advisorName = advisors[index].name;
        newResponses[advisorName] = result.advice;
        newLogs[advisorName] = result.logs || [];
      });
      setResponses(newResponses);
      setLogs(newLogs);

      // Fetch Maverick's opinion
      const maverickResponse = await fetch('/api/getMaverickOpinion', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question, riskLevel, marketSentiment, advisorResponses: newResponses }),
      }).then(res => res.json());

      setMaverickOpinion(maverickResponse.advice);
      setLogs(prev => ({ ...prev, maverick: maverickResponse.logs }));

      // Calculate consensus advice
      const consensusAdvice = calculateConsensusAdvice(newResponses);
      setConsensusAdvice(consensusAdvice);
    } catch (error) {
      console.error('Error fetching advice:', error);
      setLogs(prev => ({...prev, error: ['Error fetching advice: ' + error.message]}));
    }

    setIsLoading(false);
  };

  const calculateConsensusAdvice = (responses) => {
    // Combine all advisors' advice with markdown formatting
    const allAdvice = Object.values(responses).join('\n\n');
    return `
## Consensus Advice

After analyzing the recommendations from all advisors, here's a synthesized consensus view:

${allAdvice}

### Key Takeaways:

- Consider the diverse perspectives offered by each advisor
- Evaluate the advice in the context of your personal risk tolerance and investment goals
- Remember that this is a consensus view and may not capture all nuances of individual recommendations

*Always conduct your own research and consider consulting with a professional financial advisor before making investment decisions.*
    `;
  };

  const handleSentimentChange = (sentiment) => {
    setMarketSentiment(sentiment);
  };

  const renderMarkdown = (text) => {
    return { __html: marked(text) };
  };

  const isSubmitDisabled = !isConnected || !question.trim();
  console.log("Submit button disabled:", isSubmitDisabled, "isConnected:", isConnected, "question:", question);

  console.log("Render - isConnected:", isConnected, "address:", address, "question:", question);
  return (
    <div className="min-h-screen bg-gray-100">
      <Head>
        <title>Crypto Investment Advisor AI</title>
        <link rel="icon" href="/favicon.ico" />
      </Head>

      {/* Hero Section */}
      <section>
  {/* Container */}
  <div className="mx-auto w-full max-w-7xl px-5 py-16 md:px-10 md:py-20">
    {/* Component */}
    <div className="grid items-center gap-8 sm:gap-20 lg:grid-cols-2 lg:gap-5">
      <div>
        <h2 className="mb-6 max-w-2xl text-3xl font-bold md:mb-10 md:text-5xl lg:mb-12">
          AI-Powered Crypto Investment Advice at Your Fingertips
        </h2>
        {/* List */}
        <ul className="grid max-w-lg grid-cols-2 gap-4">
          <li className="flex items-center">
            <img
              src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
              alt=""
              className="mr-2 h-8 w-8"
            />
            <p className="text-sm sm:text-base">Multiple AI Advisors</p>
          </li>
          <li className="flex items-center">
            <img
              src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
              alt=""
              className="mr-2 h-8 w-8"
            />
            <p className="text-sm sm:text-base">Personalized Advice</p>
          </li>
          <li className="flex items-center">
            <img
              src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
              alt=""
              className="mr-2 h-8 w-8"
            />
            <p className="text-sm sm:text-base">Real-time Market Data</p>
          </li>
          <li className="flex items-center">
            <img
              src="https://assets.website-files.com/6458c625291a94a195e6cf3a/6458c625291a9473e2e6cf65_tick-circle.svg"
              alt=""
              className="mr-2 h-8 w-8"
            />
            <p className="text-sm sm:text-base">Risk Assessment</p>
          </li>
        </ul>
        {/* Divider */}
        <div className="mb-10 mt-10 w-full max-w-lg border-b border-gray-300 "></div>
        <a
          href="#advisor"
          className="inline-block bg-black px-6 py-3 font-semibold text-white"
        >
          Get Started Now
        </a>
      </div>
      <div className="aspect-w-16 aspect-h-9 lg:aspect-h-18">
      <iframe width="560" height="315" src="https://www.youtube.com/embed/xPzVdKij6VQ?si=l9p6IGgloA9qXxMn" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>
      </div>
    </div>
  </div>
</section>



      {/* Advisor Section */}
      <section id="advisor" className="py-20 bg-gray-100">
        <div className="container mx-auto">
          <h2 className="text-3xl font-bold text-center mb-10">Get AI-Powered Investment Advice</h2>
          <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
            <div className="p-8">
              <a href="https://www.buymeacoffee.com/OpenFusion" target="_blank" rel="noopener noreferrer" className="block mb-8">
                <img 
                  src="https://img.buymeacoffee.com/button-api/?text=Buy me a coffee&emoji=☕&slug=OpenFusion&button_colour=FFDD00&font_colour=000000&font_family=Cookie&outline_colour=000000&coffee_colour=ffffff" 
                  alt="Buy me a coffee"
                  className="mx-auto"
                />
              </a>
              
              <WalletConnection />
              
              <form onSubmit={handleSubmit} className="mt-8 space-y-6">
                <div>
                  <label htmlFor="question" className="block text-sm font-medium text-gray-700">Your investment question</label>
                  <input
                    type="text"
                    name="question"
                    id="question"
                    value={question}
                    onChange={(e) => setQuestion(e.target.value)}
                    required
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  />
                </div>
                <div>
                  <label htmlFor="riskLevel" className="block text-sm font-medium text-gray-700">Risk Level</label>
                  <select
                    id="riskLevel"
                    name="riskLevel"
                    value={riskLevel}
                    onChange={(e) => setRiskLevel(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                  >
                    <option value="conservative">Conservative</option>
                    <option value="balanced">Balanced</option>
                    <option value="aggressive">Aggressive</option>
                  </select>
                </div>
                <button 
                  type="submit" 
                  disabled={isSubmitDisabled}
                  className="w-full bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {isConnected ? 'Submit' : 'Connect Wallet to Submit'}
                </button>
              </form>
              
              <MarketSentimentAnalyzer onSentimentChange={handleSentimentChange} />
              
              <div className="mt-10 space-y-8">
                {advisors.map(advisor => (
                  <AdvisorResponse
                    key={advisor.name}
                    advisor={advisor.name}
                    response={responses[advisor.name]}
                    isLoading={isLoading}
                    imageUrl={advisor.image}
                  />
                ))}
                
                {maverickOpinion && (
                  <ExpandableContent
                    title={
                      <div className="flex items-center">
                        <img src="/images/maverick.png" alt="Maverick" className="w-8 h-8 mr-2 rounded-full" />
                        Maverick's Contrarian View:
                      </div>
                    }
                    content={maverickOpinion}
                    bgColor="bg-red-100"
                  />
                )}
                
                {consensusAdvice && (
                  <ExpandableContent
                    title="Consensus Advice:"
                    content={consensusAdvice}
                    bgColor="bg-green-100"
                  />
                )}
              </div>
              
              {Object.keys(responses).length > 0 && (
                <InvestmentSimulator advisorResponses={responses} />
              )}
              
              {Object.keys(responses).length > 0 && marketSentiment && (
                <RiskAssessor responses={responses} marketSentiment={marketSentiment} />
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
  