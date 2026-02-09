// Results 负责展示总分和每题复盘，不直接修改业务状态
function Results({ score, totalQuestions, results, onRestart }) {
  return (
    <section className="panel results">
      <h2>Final score</h2>
      <p className="score">
        {score} / {totalQuestions}
      </p>
      <p className="score-detail">
        Review every answer below. Timeouts are marked and scored as -1.
      </p>

      <div className="results-grid">
        {results.map((result, index) => (
          <div key={result.question} className="result-card">
            <div className="result-header">
              <span className="result-index">Q{index + 1}</span>
              <span
                className={`result-pill ${
                  result.timedOut
                    ? 'timeout'
                    : result.isCorrect
                    ? 'correct'
                    : 'incorrect'
                }`}
              >
                {/* 状态标签：超时优先，其次正确/错误 */}
                {result.timedOut ? 'Timeout' : result.isCorrect ? 'Correct' : 'Incorrect'}
              </span>
            </div>
            <h3>{result.question}</h3>
            <p>
              Your answer:{' '}
              <span className="highlight">
                {result.selectedIndex === null
                  ? 'No answer'
                  : result.options[result.selectedIndex]}
              </span>
            </p>
            <p>
              Correct answer:{' '}
              <span className="highlight">{result.options[result.correctIndex]}</span>
            </p>
            <p className="explanation">{result.explanation}</p>
          </div>
        ))}
      </div>

      {/* 点击后由父组件重置状态并回到开始页 */}
      <button className="primary" onClick={onRestart}>
        Play again
      </button>
    </section>
  )
}

export default Results
