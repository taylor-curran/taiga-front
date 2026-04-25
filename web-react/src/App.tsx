function App() {
  return (
    <div style={{ fontFamily: 'sans-serif', padding: '2rem' }}>
      <h1>Taiga &mdash; React Scaffold</h1>
      <p>
        This is the empty React shell that will replace the AngularJS frontend.
        The Vite dev server proxies every Taiga path to the reference gateway at{' '}
        <code>http://localhost:9000</code>.
      </p>
      <ul>
        <li>
          <a href="/conf.json">/conf.json</a> &mdash; frontend runtime config
        </li>
        <li>
          <a href="/api/v1/">/api/v1/</a> &mdash; self-describing API root
        </li>
      </ul>
    </div>
  )
}

export default App
