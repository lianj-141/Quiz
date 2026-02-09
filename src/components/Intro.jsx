// Intro 只负责展示开始页，不管理任何业务状态
function Intro({ onStart }) {
  return (
    <section className="panel intro">
      <h2>Ready to begin?</h2>
      <p>
        Tap start to get the first question. Each answer shows instant feedback,
        and timeouts will move you forward automatically.
      </p>
      {/* 点击后由父组件开始整场测验 */}
      <button className="primary" onClick={onStart}>
        Start the quiz
      </button>
    </section>
  )
}

export default Intro
