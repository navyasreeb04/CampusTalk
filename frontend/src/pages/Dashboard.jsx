import { useEffect, useMemo, useState } from "react";
import api from "../api/axios";
import AnalyticsBarChart from "../components/dashboard/AnalyticsBarChart";
import AnalyticsPieChart from "../components/dashboard/AnalyticsPieChart";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        setLoading(true);
        setError("");
        const { data } = await api.get("/admin/dashboard");
        setDashboardData(data);
      } catch (err) {
        setError(err.response?.data?.message || "Unable to load dashboard");
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const stats = useMemo(() => {
    const placements = dashboardData?.placements || { internship: 0, fulltime: 0 };
    const totalDemand = (dashboardData?.skillDemand || []).reduce((sum, item) => sum + item.count, 0);
    const totalOffered = (dashboardData?.skillOffered || []).reduce((sum, item) => sum + item.count, 0);

    return [
      {
        label: "Internships",
        value: placements.internship,
        helper: "Placement posts tagged as internships",
      },
      {
        label: "Full-time",
        value: placements.fulltime,
        helper: "Placement posts tagged as full-time",
      },
      {
        label: "Skill demand",
        value: totalDemand,
        helper: "Total demand-side skill mentions",
      },
      {
        label: "Skill offered",
        value: totalOffered,
        helper: "Total offered-side skill mentions",
      },
    ];
  }, [dashboardData]);

  if (loading) {
    return (
      <div className="module-page">
        <section className="section-intro dashboard-hero-panel">
          <div>
            <p className="eyebrow">Admin analytics</p>
            <h2>Preparing your dashboard</h2>
            <p>Pulling live placement and skill signals from CampusTalk.</p>
          </div>
        </section>

        <div className="dashboard-stat-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <article key={index} className="stat-card dashboard-stat-card dashboard-skeleton-card" />
          ))}
        </div>

        <div className="dashboard-power-grid">
          <article className="dashboard-card dashboard-visual-card dashboard-skeleton-card" />
          <article className="dashboard-card dashboard-visual-card dashboard-skeleton-card" />
          <article className="dashboard-card dashboard-visual-card dashboard-skeleton-card dashboard-span-full" />
        </div>
      </div>
    );
  }

  if (error) {
    return <p className="error-banner">{error}</p>;
  }

  return (
    <div className="module-page dashboard-page">
      <section className="section-intro dashboard-hero-panel">
        <div>
          <p className="eyebrow">Admin analytics</p>
          <h2>CampusTalk performance overview</h2>
          <p>
            A PowerBI-style dashboard for tracking skill demand, skill supply, and placement split
            without leaving the admin workspace.
          </p>
        </div>
        <div className="dashboard-hero-badge">
          <span>Live analytics</span>
          <strong>{(dashboardData?.skillDemand?.length || 0) + (dashboardData?.skillOffered?.length || 0)}</strong>
          <small>active skill buckets</small>
        </div>
      </section>

      <div className="dashboard-stat-grid">
        {stats.map((item) => (
          <article key={item.label} className="stat-card dashboard-stat-card">
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.helper}</small>
          </article>
        ))}
      </div>

      <div className="dashboard-power-grid">
        <AnalyticsPieChart placements={dashboardData?.placements} />
        <AnalyticsBarChart
          colors={["#b98050", "#d7a57d", "#ead8b4", "#c6a68c"]}
          eyebrow="Demand analytics"
          items={dashboardData?.skillDemand || []}
          subtitle="The most requested learning areas, grouped case-insensitively."
          title="Skill demand"
        />
        <AnalyticsBarChart
          className="dashboard-span-full"
          colors={["#7b8e71", "#93a884", "#b9c9a9", "#d6e0c8"]}
          eyebrow="Supply analytics"
          items={dashboardData?.skillOffered || []}
          subtitle="The strongest offered skill pools across student posts."
          title="Skill offered"
        />
      </div>
    </div>
  );
};

export default Dashboard;
