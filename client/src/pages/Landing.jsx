export default function Landing({ onStart }) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center">
        {/* Header */}
        <div className="mb-12">
          <div className="text-6xl mb-4">🔮</div>
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">
            The Essential EA
          </h1>
          <p className="text-xl text-slate-300 mb-2">
            AI-powered task classification for brokers & executives
          </p>
          <p className="text-slate-400">
            Save 5+ hours per week by letting AI decide what to delegate
          </p>
        </div>

        {/* CTA Button */}
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg mb-12 transition-colors w-full md:w-auto"
        >
          Try Free MVP →
        </button>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-3">🔮</div>
            <h3 className="text-white font-bold mb-2">Crystal Ball</h3>
            <p className="text-slate-400 text-sm">
              Tasks only you can do - strategic decisions, client relationships, negotiations
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-3">🎾</div>
            <h3 className="text-white font-bold mb-2">Bouncy Ball</h3>
            <p className="text-slate-400 text-sm">
              Tasks to delegate - admin, scheduling, follow-ups, coordination
            </p>
          </div>

          <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700">
            <div className="text-4xl mb-3">⚡</div>
            <h3 className="text-white font-bold mb-2">AI-Powered</h3>
            <p className="text-slate-400 text-sm">
              Instant classification with reasoning and recommended actions
            </p>
          </div>
        </div>

        {/* Pricing */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-8 rounded-lg border border-slate-700 mb-12">
          <h2 className="text-2xl font-bold text-white mb-4">Simple Pricing</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Free</h3>
              <p className="text-3xl font-bold text-blue-400 mb-4">$0</p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ 5 tasks/week</li>
                <li>✓ Basic classification</li>
                <li>✓ No credit card needed</li>
              </ul>
            </div>
            <div className="border-l border-slate-600 pl-6">
              <h3 className="text-lg font-bold text-white mb-2">Pro</h3>
              <p className="text-3xl font-bold text-blue-400 mb-4">$49<span className="text-lg">/mo</span></p>
              <ul className="text-slate-400 text-sm space-y-2">
                <li>✓ Unlimited tasks</li>
                <li>✓ Analytics dashboard</li>
                <li>✓ CSV export</li>
                <li>✓ Email support</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="mb-12">
          <h2 className="text-2xl font-bold text-white mb-6">Early Results</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <div>
              <p className="text-4xl font-bold text-blue-400">8 hrs</p>
              <p className="text-slate-400">Saved per week</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-400">95%</p>
              <p className="text-slate-400">Accuracy rate</p>
            </div>
            <div>
              <p className="text-4xl font-bold text-blue-400">60%</p>
              <p className="text-slate-400">Would pay for it</p>
            </div>
          </div>
        </div>

        {/* Quote */}
        <div className="bg-slate-800 bg-opacity-50 backdrop-blur p-6 rounded-lg border border-slate-700 mb-12 italic text-slate-300">
          "I was drowning in email. The Essential EA gave me back 8 hours a week. It's a game-changer."
          <p className="text-slate-400 mt-2 not-italic">— Kristina, Real Estate Broker</p>
        </div>

        {/* Final CTA */}
        <button
          onClick={onStart}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg text-lg transition-colors w-full md:w-auto"
        >
          Start Classifying Tasks →
        </button>

        {/* Footer */}
        <p className="text-slate-500 text-sm mt-8">
          No credit card required • Free during beta • 30-day money-back guarantee
        </p>
      </div>
    </div>
  );
}
