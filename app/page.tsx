import World from "@/components/World";
import Panels from "@/components/Panels";
import { jobs, skills, work, awards } from "@/lib/data";

const P = (a: number, b: number) =>
  ({ "--a": a, "--b": b }) as React.CSSProperties;

export default function Page() {
  return (
    <>
      <World />
      <Panels />
      <div className="xp">
        <i />
      </div>
      <section className="pn hero" style={P(-1, 0.13)}>
        <h1>Jaspreet Singh</h1>
        <p>
          Staff Software Engineer and Technical Lead. Scroll to step into the
          meeting.
        </p>
      </section>
      <section className="pn small" style={P(0.19, 0.27)}>
        <p>“Nice to meet you! Let’s talk about my work.”</p>
      </section>
      <section className="pn" style={P(0.31, 0.38)}>
        <h2>About me</h2>
        <p>
          12+ years of experience building scalable
          enterprise applications, leading engineering teams of 15–20,
          modernising legacy systems, architecting React and TypeScript
          solutions, developing reusable design systems, and leveraging
          AI-driven automation to accelerate software delivery.
        </p>
      </section>
      <section className="pn" style={P(0.38, 0.49)}>
        <h2>Selected work</h2>
        <ul>
          {work.map((w) => (
            <li key={w.t}>
              <b>{w.t}:</b> {w.d}
            </li>
          ))}
        </ul>
      </section>
      <section className="pn" style={P(0.49, 0.59)}>
        <h2>{jobs[0].role}</h2>
        <p className="m">
          {jobs[0].org} · {jobs[0].when}
        </p>
        <ul>
          {jobs[0].pts.map((x) => (
            <li key={x}>{x}</li>
          ))}
        </ul>
      </section>
      <section className="pn" style={P(0.59, 0.68)}>
        <h2>Earlier roles</h2>
        <ul>
          {jobs.slice(1).map((j) => (
            <li key={j.role}>
              <b>{j.role}</b>, {j.org} ({j.when}). {j.pts[0]}
            </li>
          ))}
        </ul>
      </section>
      <section className="pn" style={P(0.68, 0.77)}>
        <h2>Skills and awards</h2>
        <ul>
          {skills.map(([a, b]) => (
            <li key={a}>
              <b>{a}:</b> {b}
            </li>
          ))}
        </ul>
        <p className="m">{awards.join(" · ")}</p>
      </section>
      <section className="pn small" style={P(0.89, 0.94)}>
        <p>“Great talk. Let’s build this together.”</p>
      </section>
      <section className="pn end" style={P(0.97, 2)}>
        <h2>Let’s work together</h2>
        <p>
          <a href="mailto:jaspreetsingh2701.work@gmail.com">
            jaspreetsingh2701.work@gmail.com
          </a>
        </p>
        <p>
          <a target="_blank" href="https://linkedin.com/in/jaspreetsingh2701">
            linkedin.com/in/jaspreetsingh2701
          </a>
        </p>
      </section>
      <div style={{ height: "1200vh" }} aria-hidden="true" />
    </>
  );
}
