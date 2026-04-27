import {
  Camera,
  ClipboardCheck,
  Gauge,
  MonitorSmartphone,
  PackageCheck,
  RefreshCcw,
  Scale,
  Search,
  Truck,
} from "lucide-react";
import { pendingOrders, sessions } from "../lib/sample-data";

const nav = [
  { label: "Weighing", icon: Scale, active: true },
  { label: "Orders", icon: ClipboardCheck },
  { label: "Vehicles", icon: Truck },
  { label: "Cameras", icon: Camera },
];

function statusLabel(status: string) {
  switch (status) {
    case "awaiting_first_weight":
      return "First weigh";
    case "awaiting_second_weight":
      return "Second weigh";
    case "completed":
      return "Completed";
    default:
      return status;
  }
}

export default function Home() {
  const activeSecondWeighs = sessions.filter((session) => session.status === "awaiting_second_weight").length;
  const completedToday = sessions.filter((session) => session.status === "completed").length;

  return (
    <main className="app-shell">
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-mark">
            <Scale size={21} />
          </div>
          <span>WeighPro</span>
        </div>
        <nav className="nav" aria-label="Main navigation">
          {nav.map((item) => (
            <div className={item.active ? "nav-item active" : "nav-item"} key={item.label}>
              <item.icon size={18} />
              <span>{item.label}</span>
            </div>
          ))}
        </nav>
      </aside>

      <section className="main">
        <div className="topbar">
          <div>
            <h1>Weighbridge control</h1>
            <p className="subtle">Order-linked vehicle weighing, camera matching, and station hardware status.</p>
          </div>
          <div className="toolbar">
            <button className="button" title="Refresh station data">
              <RefreshCcw size={17} />
              Refresh
            </button>
            <button className="button primary">
              <PackageCheck size={17} />
              New weigh
            </button>
          </div>
        </div>

        <div className="metric-row">
          <div className="metric">
            <span className="subtle">Pending notes</span>
            <strong>{pendingOrders.length}</strong>
          </div>
          <div className="metric">
            <span className="subtle">Second weighs</span>
            <strong>{activeSecondWeighs}</strong>
          </div>
          <div className="metric">
            <span className="subtle">Completed today</span>
            <strong>{completedToday}</strong>
          </div>
          <div className="metric">
            <span className="subtle">Station link</span>
            <strong>Live</strong>
          </div>
        </div>

        <div className="dashboard">
          <section className="band">
            <div className="band-header">
              <div>
                <h2>Active sessions</h2>
                <p className="subtle">Camera reads and imported request notes guide the clerk to the right vehicle.</p>
              </div>
              <button className="button" title="Search vehicles and sessions">
                <Search size={17} />
                Search
              </button>
            </div>
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Ticket</th>
                    <th>Plate</th>
                    <th>Customer</th>
                    <th>Product</th>
                    <th>Status</th>
                    <th>Weights</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((session) => (
                    <tr key={session.id}>
                      <td>{session.id}</td>
                      <td>
                        <span className="plate">{session.plate}</span>
                      </td>
                      <td>{session.customerName}</td>
                      <td>{session.product}</td>
                      <td>
                        <span className={session.status === "awaiting_second_weight" ? "status second" : "status"}>
                          {statusLabel(session.status)}
                        </span>
                      </td>
                      <td>
                        {session.firstWeightKg ? `${session.firstWeightKg.toLocaleString()} kg` : "Not captured"}
                        {session.netWeightKg ? ` / net ${session.netWeightKg.toLocaleString()} kg` : ""}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <aside className="band">
            <div className="band-header">
              <div>
                <h2>Station</h2>
                <p className="subtle">XK3190-DS1 serial bridge and camera match.</p>
              </div>
              <MonitorSmartphone size={20} aria-hidden />
            </div>
            <div className="station-panel">
              <div className="weight-readout" aria-label="Current scale weight">
                <div>
                  <Gauge size={25} />
                  <strong>14,620</strong>
                  <span>kg stable</span>
                </div>
              </div>

              <div className="camera-match">
                <div className="match-header">
                  <div>
                    <h3>Camera match</h3>
                    <p className="subtle">GX22 FBD, 94 percent confidence</p>
                  </div>
                  <span className="status alert">Second weigh</span>
                </div>
                <div className="form-grid">
                  <div className="field">
                    <label htmlFor="plate">Plate</label>
                    <input id="plate" defaultValue="GX22 FBD" />
                  </div>
                  <div className="field">
                    <label htmlFor="ticket">Ticket</label>
                    <input id="ticket" defaultValue="WB-1048" />
                  </div>
                  <div className="field">
                    <label htmlFor="product">Product</label>
                    <input id="product" defaultValue="Bottled drinks" />
                  </div>
                  <div className="field">
                    <label htmlFor="mode">Mode</label>
                    <select id="mode" defaultValue="second">
                      <option value="first">First weigh</option>
                      <option value="second">Second weigh</option>
                    </select>
                  </div>
                </div>
                <button className="button primary">
                  <Scale size={17} />
                  Confirm weight
                </button>
              </div>
            </div>
          </aside>
        </div>
      </section>
    </main>
  );
}
