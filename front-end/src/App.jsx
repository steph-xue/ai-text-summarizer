import { useState, useRef } from "react";

function App() {

  // Set states for text, summary length, summary, loading, and error
  const [text, setText] = useState("");
  const [summaryLength, setSummaryLength] = useState(10);
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a reference for the summary output textarea
  const summaryOutputRef = useRef(null);

  // Function to summarize text calling the Anthropic API
async function summarize() {

  // If the text is empty, return
  if (!text.trim()) return;

  // Set loading to true and clear any previous error
  setLoading(true);
  setError(null);
  let errorMessage = null;

  // Call the worker to call the AI API to summarize the text
  try {

    const url = "https://ai-text-summarizer.ai-text-summarizer.workers.dev"

    const messages = [
      {
        'role': 'user',
        'content': [
          {
            'type': 'text',
            'text': `Summarize this text. Limit the summary length to ${summaryLength} words: ${text}`
          }
        ]
      }
    ]
    
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({messages})  
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Worker error: ${data.error}`)
    }

    const summaryText = data.summary || "No summary available.";
    setSummary(summaryText);



  } catch (error) {
    errorMessage = error.message;
  }
  
  // Create a delay of 5 seconds (5000 ms)
  setTimeout(() => {
    // Set loading to false after the delay
    setLoading(false); 
    // Set the error only if it exists
    if (errorMessage) {
      console.log(errorMessage);
      setError("Unable to access AI. Please refresh and try again.");
    }
  }, 5000);
}

  // Function to copy the summary to the clipboard
  async function copyToClipboard() {
    
    // If the summary is empty, return
    if (!summary) return;

    if (summaryOutputRef.current) {
      try {
        await navigator.clipboard.writeText(summaryOutputRef.current.value);
        alert("Copied to clipboard!");
      } catch (err) {
        alert("Failed to copy.");
      }
    }
  };

  // Function to clear all text and states
  function clearAll() {
    setText("");
    setSummary("");
    setError(null);
  };

  // Render the app
  return (
    <div className="flex-column container">

       {/* Header */}
       <div className="header">
          <div className="header-text">
            <h2 className="header-title-line-1">The AI Text</h2>
            <h2 className="header-title-line-2">Summarizer</h2>
          </div>
          <img className="header-image" src="images/cat.jpg" alt="Cute cat" />
      </div>

      <main>
         {/* Text input */}
        <section className="flex-column text-input-area-section">
          <textarea
            value={text}
            onChange={(event) => setText(event.target.value)}
            aria-label="Paste text here to summarize"
            placeholder="Paste text here to summarize"
          />
        </section>

        {/* Length of summary controls */}
        <div className="flex-column controls">
            <div className="flex-column summary-length-container">
              <div className="summary-length-group">
                <span className="summary-length-min-label">1</span>
                <input 
                  type="range" 
                  className="summary-length-input" 
                  min="1" max="100" 
                  value={summaryLength}
                  aria-labelledby="summary-length-text" 
                  onChange={(event) => setSummaryLength(event.target.value)}
                />
                <span className="summary-length-max-label">100</span>
              </div>
              <span className="summary-length-text">Summary Length: {summaryLength} words</span>
            </div>
            <button 
              className="button summarize-button" 
              onClick={summarize}
            >
              Summarize
            </button>
          </div>

        {/* Text output */}
        {!loading && !error &&
          <section className="flex-column summary-output-section">
            <div className="flex-column summary-content">
              <textarea 
                placeholder="See summary here" 
                aria-label="Summary of text" 
                disabled
                ref={summaryOutputRef}
                value={summary}
                readOnly
              >
              </textarea>
              <div className="flex-column controls">
                <button 
                  className="button copy-button" 
                  onClick={copyToClipboard}
                >
                  Copy
                </button>
                <button 
                  className="button clear-button" 
                  onClick={clearAll}
                >
                  Clear
                </button>
              </div>
            </div>
          </section>
        }

        {loading && 
          <div className="flex-column loading-section">
            <img className="spinner-image" src="images/loading-spinner.svg" alt="Loading spinner" />
            <p className="loading-text">Summarizing...</p>
				  </div>
        }

        {error && 
          <div className="flex-column error-section">
            <p className="error-message">{error}</p>
            <button 
              className="button dismiss-button"
              onClick={clearAll}
            >
              Dismiss Error
            </button>
          </div>
        }

      </main>
    </div>
  );
}

export default App;
