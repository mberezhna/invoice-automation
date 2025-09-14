import './App.scss'

function App() {

  return (
    <div className="invoices">
      <header className='header'>
        <div className="header_titles">
          <th>Invoice ID</th>
          <th>Client name</th>
          <th>Data Due</th>
          <th>Date issue</th>
          <th>Amount</th>
          <th>status</th>
          <th>invoice PDF</th>
        </div>
        <div className="header_bottom-line"></div>
      </header>
    </div>
  )
}

export default App
