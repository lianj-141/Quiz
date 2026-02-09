// QuizPanel 只负责答题页展示；数据与状态更新都由父组件传入
function QuizPanel({
  current,
  questionIndex,
  totalQuestions,
  score,
  timeLeft,
  progress,
  selectedIndex,
  showFeedback,
  timedOut,
  onAnswer,
  onNext
}) {
  return (
    <section className="panel quiz">
      {/* 顶部信息：题号、分数、剩余时间 */}
      <div className="quiz-meta">
        <div>
          <span className="label">Question</span>
          <span className="value">
            {questionIndex + 1} / {totalQuestions}
          </span>
        </div>
        <div>
          <span className="label">Score</span>
          <span className="value">{score}</span>
        </div>
        <div>
          <span className="label">Time left</span>
          <span className={`value ${timeLeft <= 10 ? 'urgent' : ''}`}>
            {timeLeft}s
          </span>
        </div>
      </div>

      <div className="progress">
        <div className="progress-bar" style={{ width: `${progress}%` }} />
      </div>

      <div className="question-card">
        <h2>{current.question}</h2>
        <div className="options">
          {current.options.map((option, index) => {
            // 下面三个变量用于决定按钮样式（正确/错误/默认）
            const isCorrect = index === current.correctIndex
            const isSelected = index === selectedIndex
            const showState = showFeedback

            let className = 'option'

            if (showState && isCorrect) {
              className += ' correct'
            }

            if (showState && isSelected && !isCorrect) {
              className += ' incorrect'
            }

            return (
              <button
                key={option}
                className={className}
                // 点击选项时把索引回传给父组件
                onClick={() => onAnswer(index)}
                // 展示反馈后禁止继续点击选项
                disabled={showFeedback}
              >
                {option}
              </button>
            )
          })}
        </div>

        {showFeedback && (
          <div className="feedback">
            <p className="feedback-title">
              {/* 三种反馈文案：超时 / 选对 / 选错 */}
              {timedOut
                ? 'Time is up!'
                : selectedIndex === current.correctIndex
                ? 'Correct!'
                : 'Not quite.'}
            </p>
            <p>
              The correct answer is{' '}
              <span className="highlight">{current.options[current.correctIndex]}</span>.{' '}
              {current.explanation}
            </p>
          </div>
        )}
      </div>

      {showFeedback && !timedOut && (
        <button className="secondary" onClick={onNext}>
          {/* 最后一题按钮文案切换为查看结果 */}
          {questionIndex === totalQuestions - 1 ? 'View results' : 'Next question'}
        </button>
      )}
    </section>
  )
}

export default QuizPanel
