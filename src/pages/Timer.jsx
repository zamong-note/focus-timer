import React, { useState, useEffect, useRef, useCallback } from "react";
import { api } from "../api";

const WORK = 25 * 60;
const BREAK = 5 * 60;
const R = 145;
const CIRC = 2 * Math.PI * R;

function fmt(s) {
  const m = String(Math.floor(s / 60)).padStart(2, "0");
  const sec = String(s % 60).padStart(2, "0");
  return `${m}:${sec}`;
}

export default function Timer() {
  const [subjects, setSubjects] = useState([]);
  const [selected, setSelected] = useState(null);
  const [mode, setMode] = useState("work"); // work | break
  const [remaining, setRemaining] = useState(WORK);
  const [running, setRunning] = useState(false);
  const intervalRef = useRef(null);

  // 과목 불러오기 + 마지막 선택 복원(localStorage)
  useEffect(() => {
    api.getSubjects().then((data) => {
      setSubjects(data);
      const saved = Number(localStorage.getItem("lastSubject"));
      const exists = data.find((s) => s.id === saved);
      setSelected(exists ? saved : data[0]?.id ?? null);
    });
  }, []);

  const total = mode === "work" ? WORK : BREAK;

  const finish = useCallback(async () => {
    setRunning(false);
    if (mode === "work") {
      // 작업 세션 완료 → 백엔드 저장
      if (selected) {
        try {
          await api.addSession(selected, WORK / 60);
        } catch (e) {
          console.error(e);
        }
      }
      // 알림
      try {
        new Audio(
          "data:audio/wav;base64,UklGRl9vT19XQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQAAAAA="
        ).play();
      } catch {}
      alert("🎉 25분 집중 완료! 5분 휴식하세요.");
      setMode("break");
      setRemaining(BREAK);
    } else {
      alert("휴식 끝! 다시 집중해볼까요?");
      setMode("work");
      setRemaining(WORK);
    }
  }, [mode, selected]);

  // 카운트다운
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setRemaining((r) => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          finish();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [running, finish]);

  const reset = () => {
    setRunning(false);
    setRemaining(mode === "work" ? WORK : BREAK);
  };

  const pickSubject = (id) => {
    setSelected(id);
    localStorage.setItem("lastSubject", String(id));
  };

  const offset = CIRC * (1 - remaining / total);

  return (
    <div>
      <h1 className="page-title">집중할 시간이에요.</h1>
      <p className="page-sub">
        25분 집중, 5분 휴식. 과목을 고르고 시작하세요. 완료하면 자동으로 기록됩니다.
      </p>

      <div className="timer-wrap">
        <div className="timer-ring">
          <svg width="320" height="320">
            <circle className="timer-track" cx="160" cy="160" r={R} />
            <circle
              className="timer-prog"
              cx="160"
              cy="160"
              r={R}
              strokeDasharray={CIRC}
              strokeDashoffset={offset}
              style={{ stroke: mode === "break" ? "var(--green)" : "var(--accent)" }}
            />
          </svg>
          <div className="timer-center">
            <div>
              <div className="timer-time">{fmt(remaining)}</div>
              <div className="timer-mode">{mode === "work" ? "집중" : "휴식"}</div>
            </div>
          </div>
        </div>

        <div className="timer-controls">
          {!running ? (
            <button
              className="btn btn-primary"
              onClick={() => setRunning(true)}
              disabled={!selected}
            >
              ▶ 시작
            </button>
          ) : (
            <button className="btn" onClick={() => setRunning(false)}>
              ⏸ 일시정지
            </button>
          )}
          <button className="btn btn-ghost" onClick={reset}>
            ↺ 리셋
          </button>
        </div>

        <div className="subject-pick">
          {subjects.length === 0 && (
            <span className="empty">과목이 없습니다. History 페이지에서 추가하세요.</span>
          )}
          {subjects.map((s) => (
            <button
              key={s.id}
              className={`chip ${selected === s.id ? "active" : ""}`}
              onClick={() => pickSubject(s.id)}
            >
              {s.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
