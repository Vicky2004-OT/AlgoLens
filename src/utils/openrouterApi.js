// OpenRouter API - AI chat integration for AlgoLens

export async function callOpenRouterAPI(messages, apiKey) {
  if (!apiKey) {
    throw new Error('API key is required. Please set your OpenRouter API key in settings.');
  }

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'HTTP-Referer': 'https://algolens.app',
        'X-Title': 'AlgoLens',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'mistralai/mistral-7b-instruct',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`API Error: ${response.status} - ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenRouter API Error:', error);
    throw error;
  }
}

export function getSystemPrompt() {
  return `You are AlgoLens AI, an expert in algorithmic fairness, machine learning bias, and ethical AI. 
You help students and researchers understand how bias enters AI systems, how it is measured, and how it can be mitigated. 
Be clear, educational, and use real-world examples. When relevant, reference what the user might be seeing in their bias simulation.

Key topics you can help with:
- How bias enters machine learning systems
- Different types of bias (selection bias, measurement bias, algorithmic bias)
- Fairness metrics and their interpretations
- Real-world examples of AI bias (Amazon hiring, COMPAS, healthcare algorithms)
- Bias mitigation techniques
- The 4/5ths rule and legal frameworks
- Proxy discrimination and protected attributes
- Individual vs group fairness
- Trade-offs between different fairness notions

Always be educational and provide actionable insights. If you don't know something, admit it and suggest reliable resources.`;
}

export function getSuggestedPrompts() {
  return [
    "Why does zip code create bias?",
    "Explain demographic parity simply",
    "What is the 4/5ths rule?",
    "How did Amazon's hiring AI fail?",
    "What is proxy discrimination?",
    "How can bias be removed from models?",
    "What's the difference between individual and group fairness?",
    "Explain the COMPAS algorithm controversy",
    "How do I measure fairness in my model?",
    "What are the trade-offs between different fairness metrics?"
  ];
}

export async function generateBiasSummary(dataset, metrics, apiKey) {
  // Generate a summary of the bias analysis using AI
  const summaryPrompt = `Based on the following bias analysis data, provide a brief, educational summary of what these results mean:

Dataset Summary:
- Total applicants: ${dataset.length}
- Overall approval rate (biased): ${(dataset.filter(d => d.biasedDecision === 'Approved').length / dataset.length * 100).toFixed(1)}%
- Overall approval rate (unbiased): ${(dataset.filter(d => d.unbiasedDecision === 'Approved').length / dataset.length * 100).toFixed(1)}%

Fairness Metrics:
${metrics.map(m => `- ${m.metric}: ${m.explanation}`).join('\n')}

Please provide a 2-3 paragraph summary that explains:
1. What the data shows about bias in this system
2. The key fairness concerns
3. What this means in practical terms

Keep it educational and accessible for students.`;

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: summaryPrompt }
  ];

  try {
    return await callOpenRouterAPI(messages, apiKey);
  } catch (error) {
    return 'Unable to generate AI summary. Please check your API key and try again.';
  }
}

export function validateApiKey(apiKey) {
  // Basic validation for OpenRouter API key format
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }
  
  // OpenRouter API keys typically start with 'sk-or-v1-'
  return apiKey.startsWith('sk-or-v1-') && apiKey.length > 20;
}

export function getApiKeyFromStorage() {
  try {
    return localStorage.getItem('algolens_api_key');
  } catch (error) {
    console.error('Error reading API key from storage:', error);
    return null;
  }
}

export function saveApiKeyToStorage(apiKey) {
  try {
    localStorage.setItem('algolens_api_key', apiKey);
    return true;
  } catch (error) {
    console.error('Error saving API key to storage:', error);
    return false;
  }
}

export function removeApiKeyFromStorage() {
  try {
    localStorage.removeItem('algolens_api_key');
    return true;
  } catch (error) {
    console.error('Error removing API key from storage:', error);
    return false;
  }
}
