export default function ModeSelector({ mode, setMode }) {
  return (
    <>
      <button onClick={() => setMode('grid')}>Grid</button>
      <button onClick={() => setMode('nodes')}>Nodes</button>
    </>
  )
}
