function ToolCard({ tool, onOpen }) {
  return (
    <div className="tool-card">
      <div className="tool-icon">{tool.name.charAt(0)}</div>
      <h3>{tool.name}</h3>
      <p>{tool.description}</p>
      {tool.page ? (
        <button onClick={() => onOpen(tool.page)}>Open Tool</button>
      ) : (
        <button disabled>Coming Soon</button>
      )}
    </div>
  )
}

export default ToolCard
