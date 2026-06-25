import { useEffect, useMemo, useState } from "react";
import api from "../context/api";

const defaultTopics = "AI > ML > DL > Transformers > LLM > Agentic AI > Agents";

export default function CareerRoadmap() {
  const [roadmaps, setRoadmaps] = useState([]);
  const [title, setTitle] = useState("");
  const [topics, setTopics] = useState(defaultTopics);
  const [targetCompletionDate, setTargetCompletionDate] = useState("");
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchRoadmaps();
  }, []);

  const activeRoadmap = useMemo(() => roadmaps[0] || null, [roadmaps]);

  const fetchRoadmaps = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/career-roadmaps");
      setRoadmaps(response.data.roadmaps || []);
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to load roadmaps.");
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = async (event) => {
    event.preventDefault();
    setError("");
    setGenerating(true);

    try {
      const response = await api.post("/api/career-roadmaps", {
        title,
        topics,
        targetCompletionDate,
      });
      setRoadmaps((current) => [response.data.roadmap, ...current]);
      setTitle("");
      setTopics(defaultTopics);
      setTargetCompletionDate("");
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to generate roadmap.");
    } finally {
      setGenerating(false);
    }
  };

  const toggleChecklistItem = async (roadmapId, item) => {
    try {
      const response = await api.put(
        `/api/career-roadmaps/${roadmapId}/checklist/${item._id}`,
        { completed: !item.completed }
      );
      setRoadmaps((current) =>
        current.map((roadmap) =>
          roadmap._id === roadmapId ? response.data.roadmap : roadmap
        )
      );
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to update item.");
    }
  };

  const deleteRoadmap = async (roadmapId) => {
    try {
      await api.delete(`/api/career-roadmaps/${roadmapId}`);
      setRoadmaps((current) => current.filter((roadmap) => roadmap._id !== roadmapId));
    } catch (requestError) {
      setError(requestError.response?.data?.message || "Unable to delete roadmap.");
    }
  };

  return (
    <div className="page-container">
      <div className="dashboard-header">
        <div>
          <h1>Career Roadmap</h1>
          <p className="page-subtitle">
            Turn a topic path into structured modules, milestones, and completion tracking.
          </p>
        </div>

        <div className="stats-overview">
          <div className="stat-card">
            <span className="stat-label">Progress</span>
            <span className="stat-value">{activeRoadmap?.summary?.progress || 0}%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Remaining Modules</span>
            <span className="stat-value">{activeRoadmap?.summary?.remainingModules || 0}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Completion</span>
            <span className="contest-next-label">
              {activeRoadmap?.summary?.estimatedStatus || "No roadmap"}
            </span>
          </div>
        </div>
      </div>

      <form className="add-task-form roadmap-form" onSubmit={handleGenerate}>
        <div className="section-header">
          <h2>Create Roadmap</h2>
        </div>

        <label className="field-group">
          <span>Roadmap name</span>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Example: AI Engineer"
            required
          />
        </label>

        <label className="field-group">
          <span>Topics</span>
          <textarea
            value={topics}
            onChange={(event) => setTopics(event.target.value)}
            placeholder="AI > ML > DL > Transformers > LLM > Agentic AI > Agents"
            required
          />
        </label>

        <label className="field-group">
          <span>Target completion date</span>
          <input
            type="date"
            value={targetCompletionDate}
            onChange={(event) => setTargetCompletionDate(event.target.value)}
            required
          />
        </label>

        {error ? <p className="form-error">{error}</p> : null}

        <button type="submit" disabled={generating}>
          {generating ? "Generating..." : "Generate Roadmap"}
        </button>
      </form>

      <section className="section roadmap-list">
        <div className="section-header">
          <h2>Your Roadmaps</h2>
          <span className="task-count">{roadmaps.length}</span>
        </div>

        {loading ? (
          <div className="loading-state">
            <p>Loading roadmaps...</p>
          </div>
        ) : roadmaps.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">R</div>
            <h3>No roadmap yet</h3>
            <p>Create one from your learning path to begin tracking modules.</p>
          </div>
        ) : (
          <div className="roadmap-stack">
            {roadmaps.map((roadmap) => (
              <article key={roadmap._id} className="roadmap-card">
                <div className="roadmap-card-header">
                  <div>
                    <h3>{roadmap.title}</h3>
                    <p className="page-subtitle">
                      Target: {new Date(roadmap.targetCompletionDate).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="danger"
                    onClick={() => deleteRoadmap(roadmap._id)}
                  >
                    Delete
                  </button>
                </div>

                <div className="roadmap-progress">
                  <div style={{ width: `${roadmap.summary.progress}%` }} />
                </div>
                <p className="roadmap-summary">
                  {roadmap.summary.progress}% complete, {roadmap.summary.completedItems}/
                  {roadmap.summary.totalItems} tasks done.
                </p>

                <div className="roadmap-modules">
                  {roadmap.modules.map((module) => (
                    <section key={module._id} className="roadmap-module">
                      <div className="roadmap-module-header">
                        <h4>{module.title}</h4>
                        <span className={module.completed ? "badge" : "task-count"}>
                          {module.completed ? "Complete" : "In progress"}
                        </span>
                      </div>
                      <p>{module.description}</p>

                      {module.milestones.map((milestone) => (
                        <div key={milestone._id} className="roadmap-milestone">
                          <strong>{milestone.title}</strong>
                          {milestone.checklist.map((item) => (
                            <label key={item._id} className="checklist-item-row">
                              <input
                                type="checkbox"
                                checked={item.completed}
                                onChange={() => toggleChecklistItem(roadmap._id, item)}
                              />
                              <span className={item.completed ? "checklist-text completed" : ""}>
                                {item.title}
                              </span>
                            </label>
                          ))}
                        </div>
                      ))}
                    </section>
                  ))}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
