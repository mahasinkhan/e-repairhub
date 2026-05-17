import './Profile.css'

export default function Profile() {
  return (
    <section className="page">
      <header className="pageHeader">
        <h1 className="pageTitle">Profile</h1>
        <p className="pageSubtitle">This is Profile Page</p>
      </header>

      <div className="pageCard">
        <div className="pageCardTitle">Dummy Content</div>
        <div className="pageCardText">
          Manage your profile and account settings here.
        </div>
      </div>
    </section>
  )
}

