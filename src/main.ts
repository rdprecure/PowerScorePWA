import './style.css'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="powerscore">
    <header class="app-header">
      <div>
        <h1>PowerScore</h1>
        <p>Powerlifting Meet Management</p>
      </div>
      <div class="version">
        Development Version
      </div>
    </header>

    <main>
      <section class="welcome">
        <h2>Welcome to PowerScore</h2>

        <p>
          Select an option to begin.
        </p>

        <div class="actions">
          <button id="newMeet">New Meet</button>
          <button id="openMeet">Open Meet</button>
        </div>
      </section>
    </main>
  </div>
`