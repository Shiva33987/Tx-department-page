import { useEffect, useMemo, useState } from "react";
import { fallbackDoctors } from "./data/fallbackDoctors";

const API_ENDPOINT = "https://api.txhospitals.vgworld.in/getAllDoctors";
const BRANCH_NAME = "TX Hospitals, Miyapur";
const BRANCH_LOCATION_KEY = "miyapur";
const BRANCH_RATING = 4.8;

const departmentDetails = {
  "ANAESTHESIA AND PAIN MANAGEMENT":
    "Safe anaesthesia and advanced pain relief for surgery and chronic pain.",
  "CARDIAC SCIENCES":
    "Advanced heart care with modern diagnostics and minimally invasive treatments.",
  "DERMATOLOGY, COSMETIC CARE & PLASTIC SURGERY":
    "Medical, aesthetic and reconstructive care for skin, form and confidence.",
  "INTERNAL MEDICINE":
    "Preventive and chronic disease management for overall adult health.",
  "MEDICAL GASTROENTEROLOGY":
    "Complete digestive and liver care with endoscopy and advanced therapies.",
  NEPHROLOGY:
    "Expert treatment for kidney diseases, dialysis and renal transplants.",
  ONCOLOGY:
    "Comprehensive cancer care with precision diagnostics and multidisciplinary treatment.",
  ORTHOPAEDICS:
    "Expert bone, joint and spine solutions with surgical and rehab support.",
  "SURGICAL GASTROENTEROLOGY":
    "Advanced GI surgery and transplant-focused care for complex digestive conditions.",
  UROLOGY:
    "Advanced care for urinary tract, prostate and bladder disorders.",
};

const departmentIcons = {
  "ALL": "🏥",
  "ANAESTHESIA AND PAIN MANAGEMENT": "💉",
  "CARDIAC SCIENCES": "❤️",
  "DERMATOLOGY, COSMETIC CARE & PLASTIC SURGERY": "✨",
  "INTERNAL MEDICINE": "🩺",
  "MEDICAL GASTROENTEROLOGY": "🫁",
  NEPHROLOGY: "🫘",
  ONCOLOGY: "🔬",
  ORTHOPAEDICS: "🦴",
  "SURGICAL GASTROENTEROLOGY": "⚕️",
  UROLOGY: "💧",
  "GENERAL MEDICINE": "🩻",
};

const toTitleCase = (str) =>
  str
    .toLowerCase()
    .replace(/\b(\w)/g, (c) => c.toUpperCase())
    .replace(/\bAnd\b/g, "and")
    .replace(/\b&\b/g, "&");

const cleanText = (value) => String(value ?? "").replace(/\s+/g, " ").trim();

const toDoctorLink = (value) => {
  if (!value) return "https://txhospitals.in/doctors/";
  if (value.startsWith("http")) return value;
  return `https://txhospitals.in${value.startsWith("/") ? value : `/${value}`}`;
};

const getYears = (experience) => {
  const match = cleanText(experience).match(/\d+/);
  return match ? Number(match[0]) : 0;
};

const departmentCode = (department) => {
  const tokens = department.split(/[^A-Za-z]+/).filter(Boolean);
  const code = tokens.map((token) => token[0]).join("");
  return code.slice(0, 4) || "TX";
};

const normalizeDoctor = (doctor) => {
  const location = Array.isArray(doctor.location)
    ? doctor.location.join(", ")
    : cleanText(doctor.location);

  return {
    name: cleanText(doctor.name || "TX Specialist"),
    department: cleanText(doctor.department || "GENERAL MEDICINE").toUpperCase(),
    designation: cleanText(doctor.designation || "Consultant"),
    experience: cleanText(doctor.experience || "Experienced"),
    qualification: cleanText(doctor.qualification || "Details available on profile"),
    location: cleanText(location || "Miyapur, Hyderabad"),
    image: cleanText(doctor.image),
    url: toDoctorLink(cleanText(doctor.url)),
  };
};

function App() {
  const [doctorFeed, setDoctorFeed] = useState(fallbackDoctors);
  const [isLoading, setIsLoading] = useState(true);
  const [feedSource, setFeedSource] = useState("fallback");
  const [activeDepartment, setActiveDepartment] = useState("ALL");

  useEffect(() => {
    const controller = new AbortController();

    const loadDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(API_ENDPOINT, { signal: controller.signal });

        if (!response.ok) {
          throw new Error("Unable to load live doctors feed");
        }

        const data = await response.json();

        if (!Array.isArray(data)) {
          throw new Error("Unexpected API response");
        }

        setDoctorFeed(data);
        setFeedSource("live");
      } catch (error) {
        if (error.name !== "AbortError") {
          setDoctorFeed(fallbackDoctors);
          setFeedSource("fallback");
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();

    return () => controller.abort();
  }, []);

  const miyapurDoctors = useMemo(() => {
    const mappedDoctors = doctorFeed.map(normalizeDoctor);
    const filtered = mappedDoctors.filter((doctor) =>
      doctor.location.toLowerCase().includes(BRANCH_LOCATION_KEY)
    );

    const deduped = [];
    const seen = new Set();

    filtered.forEach((doctor) => {
      const key = `${doctor.name}-${doctor.department}`;
      if (!seen.has(key)) {
        seen.add(key);
        deduped.push(doctor);
      }
    });

    return deduped;
  }, [doctorFeed]);

  const groupedDoctors = useMemo(() => {
    return miyapurDoctors.reduce((accumulator, doctor) => {
      if (!accumulator[doctor.department]) {
        accumulator[doctor.department] = [];
      }
      accumulator[doctor.department].push(doctor);
      return accumulator;
    }, {});
  }, [miyapurDoctors]);

  const orderedDepartments = useMemo(() => {
    return Object.keys(groupedDoctors).sort((a, b) => {
      const countDiff = groupedDoctors[b].length - groupedDoctors[a].length;
      if (countDiff !== 0) return countDiff;
      return a.localeCompare(b);
    });
  }, [groupedDoctors]);

  const totalExperience = miyapurDoctors.reduce(
    (sum, doctor) => sum + getYears(doctor.experience),
    0
  );

  const averageExperience = miyapurDoctors.length
    ? Math.round(totalExperience / miyapurDoctors.length)
    : 0;

  const visibleDepartments =
    activeDepartment === "ALL"
      ? orderedDepartments
      : orderedDepartments.filter((department) => department === activeDepartment);

  return (
    <div className="page-shell">
      <div className="glow-orb glow-orb-one" />
      <div className="glow-orb glow-orb-two" />

      <main className="content-wrap">
        {/* ── Hero ── */}
        <section className="hero-panel reveal-up">
          <p className="eyebrow">Department-Wise Specialist Directory</p>
          <h1>{BRANCH_NAME}</h1>
          <p className="hero-copy">
            Curated clinical teams, premium care pathways, and specialist-first consultation
            access for every major department in the Miyapur branch.
          </p>

          <div className="hero-meta-row">
            <span className="meta-pill">Hospital Rating {BRANCH_RATING.toFixed(1)} / 5.0</span>
            <span className={`meta-pill ${feedSource === "live" ? "live" : "fallback"}`}>
              {feedSource === "live" ? "Live Doctors Feed" : "Curated Backup Feed"}
            </span>
            <span className="meta-pill">24x7 Emergency Ready</span>
          </div>

          <div className="stats-grid">
            <article className="stat-card">
              <h3>{miyapurDoctors.length}</h3>
              <p>Consultants In Miyapur</p>
            </article>
            <article className="stat-card">
              <h3>{orderedDepartments.length}</h3>
              <p>Active Departments</p>
            </article>
            <article className="stat-card">
              <h3>{averageExperience}+</h3>
              <p>Average Years Experience</p>
            </article>
            <article className="stat-card">
              <h3>Premium</h3>
              <p>Patient-First Clinical Journey</p>
            </article>
          </div>
        </section>

        {/* ── Sidebar + Content ── */}
        <div className="browse-layout">

          {/* Left Sidebar */}
          <aside className="dept-sidebar reveal-up">
            <div className="sidebar-header">
              <div className="sidebar-header-top">
                <h2 className="sidebar-title">Departments</h2>
                <span className="sidebar-badge">{orderedDepartments.length}</span>
              </div>
              <p className="sidebar-subtitle">Select a specialty to browse consultants.</p>
            </div>

            <nav className="sidebar-nav">
              {/* All */}
              <button
                type="button"
                className={`sidebar-item ${activeDepartment === "ALL" ? "active" : ""}`}
                onClick={() => setActiveDepartment("ALL")}
              >
                <div className="sidebar-item-icon">🏥</div>
                <div className="sidebar-item-body">
                  <span className="sidebar-item-name">All Departments</span>
                  <span className="sidebar-item-count">{miyapurDoctors.length} doctors</span>
                </div>
                <span className="sidebar-item-arrow">›</span>
              </button>

              <div className="sidebar-divider" />

              {orderedDepartments.map((department) => (
                <button
                  key={department}
                  type="button"
                  className={`sidebar-item ${activeDepartment === department ? "active" : ""}`}
                  onClick={() => setActiveDepartment(department)}
                >
                  <div className="sidebar-item-icon">
                    {departmentIcons[department] || "⚕️"}
                  </div>
                  <div className="sidebar-item-body">
                    <span className="sidebar-item-name">
                      {toTitleCase(department)}
                    </span>
                    <span className="sidebar-item-count">
                      {groupedDoctors[department]?.length ?? 0} doctors
                    </span>
                  </div>
                  <span className="sidebar-item-arrow">›</span>
                </button>
              ))}
            </nav>
          </aside>

          {/* Right Content */}
          <div className="dept-main">
            {isLoading && (
              <div className="loading-card reveal-up">
                <p>Loading department structure and doctors for Miyapur…</p>
              </div>
            )}

            {visibleDepartments.map((department) => {
              const doctors = groupedDoctors[department] || [];

              return (
                <section key={department} className="department-block reveal-up">
                  <header className="department-header">
                    <div className="department-badge">{departmentCode(department)}</div>
                    <div>
                      <h3>{toTitleCase(department)}</h3>
                      <p>
                        {departmentDetails[department] ||
                          "Multidisciplinary specialist care designed around faster recovery and better outcomes."}
                      </p>
                    </div>
                    <div className="department-count">
                      <strong>{doctors.length}</strong>
                      <span>Doctors</span>
                    </div>
                  </header>

                  <div className="doctor-grid">
                    {doctors.map((doctor) => (
                      <article key={`${doctor.name}-${doctor.department}`} className="doctor-card">
                        <div className="doctor-photo-wrap">
                          {doctor.image ? (
                            <img
                              src={doctor.image}
                              alt={doctor.name}
                              loading="lazy"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          ) : null}
                          <div className="photo-overlay" />
                          <span className="photo-dept-tag">{departmentCode(doctor.department)}</span>
                        </div>

                        <div className="doctor-content">
                          <h4>{doctor.name}</h4>
                          <p className="designation">{doctor.designation}</p>

                          <ul className="doctor-facts">
                            <li>
                              <span>Experience</span>
                              <strong>{doctor.experience}</strong>
                            </li>
                            <li>
                              <span>Qualification</span>
                              <strong>{doctor.qualification}</strong>
                            </li>
                            <li>
                              <span>Branch</span>
                              <strong>{doctor.location}</strong>
                            </li>
                          </ul>

                          <a
                            className="profile-link"
                            href={doctor.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            <span>View Full Profile</span>
                            <span className="profile-link-arrow">→</span>
                          </a>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
