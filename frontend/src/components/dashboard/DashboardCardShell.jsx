const DashboardCardShell = ({ eyebrow, title, subtitle, children, className = "" }) => (
  <article className={`dashboard-card dashboard-visual-card ${className}`.trim()}>
    <div className="dashboard-visual-head">
      <div>
        <p className="eyebrow">{eyebrow}</p>
        <h3>{title}</h3>
      </div>
      {subtitle ? <p className="dashboard-visual-copy">{subtitle}</p> : null}
    </div>
    <div className="dashboard-visual-body">{children}</div>
  </article>
);

export default DashboardCardShell;
