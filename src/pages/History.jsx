import React, { useState, useEffect, useCallback } from "react";
import { api } from "../api";

function formatDate(iso) {
  const d = new Date(iso);
  return d.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function History() {
  const [subjects, setSubjects] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [subjectId, setSubjectId] = useState("");
  const [range, setRange] = useState("all");
  const [newSubject, setNewSubject] = useState("");

  const loadSubjects = useCallback(() => {
    api.getSubjects().then(setSubjects);
  }, []);

  const loadSessions = useCallback(() => {
    setLoading(true);
    api
      .getSessions({
        subjectId: subjectId || undefined,
        range: range !== "all" ? range : undefined,
      })
      .then((data) => {
        setSessions(data);
        setLoading(false);
      });
  }, [subjectId, range]);

  useEffect(() => {
    loadSubjects();
  }, [loadSubjects]);
  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  const removeSession = async (id) => {
    await api.deleteSession(id);
    loadSessions();
  };

  const addSubject = async () => {
    const name = newSubject.trim();
    if (!name) return;
    await api.addSubject(name);
    setNewSubject("");
    loadSubjects();
  };

  const removeSubject = async (id) => {
    if (!window.confirm("이 과목과 관련된 세션도 모두 삭제됩니다. 계속할까요?")) return;
    await api.deleteSubject(id);
    loadSubjects();
    loadSessions();
  };

  return (
    <div>
      <h1 className="page-title">기록</h1>
      <p className="page-sub">지난 집중 세션을 확인하고 정리하세요.</p>

      <div className="filters">
        <select value={subjectId} onChange={(e) => setSubjectId(e.target.value)}>
          <option value="">모든 과목</option>
          {subjects.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </select>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="all">전체 기간</option>
          <option value="week">최근 1주</option>
          <option value="month">최근 1개월</option>
        </select>
      </div>

      {loading ? (
        <div className="loading">불러오는 중...</div>
      ) : sessions.length === 0 ? (
        <div className="empty">기록이 없습니다.</div>
      ) : (
        sessions.map((s) => (
          <div className="session-row" key={s.id}>
            <div className="session-left">
              <span className="session-tag">{s.subject_name}</span>
              <span className="session-dur">{s.duration}분</span>
            </div>
            <div className="session-left">
              <span className="session-date">{formatDate(s.created_at)}</span>
              <button
                className="icon-btn"
                onClick={() => removeSession(s.id)}
                title="삭제"
              >
                ✕
              </button>
            </div>
          </div>
        ))
      )}

      <div className="card manage">
        <div className="chart-title">과목 관리</div>
        <div className="manage-row" style={{ marginBottom: 16 }}>
          <input
            className="input"
            placeholder="새 과목 이름"
            value={newSubject}
            onChange={(e) => setNewSubject(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addSubject()}
          />
          <button className="btn btn-primary" onClick={addSubject}>
            추가
          </button>
        </div>
        {subjects.map((s) => (
          <div className="subj-line" key={s.id}>
            <span className="session-tag">{s.name}</span>
            <button className="icon-btn" onClick={() => removeSubject(s.id)} title="삭제">
              ✕
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
