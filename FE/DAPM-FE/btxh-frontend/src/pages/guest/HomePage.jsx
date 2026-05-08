import Anh1 from "../../assets/Anh1_Home.jpg";
import Anh2 from "../../assets/Anh2_Home.jpg";
export default function HomePage() {
  const features = [
    {
      dot: "#0D47A1",
      title: "Tiếp nhận tận tâm",
      desc: "Mọi đứa trẻ đến với chúng tôi đều được chào đón bằng vòng tay ấm áp và quy trình tiếp nhận chuyên sâu, đảm bảo sự an toàn và ổn định tâm lý ngay từ những bước chân đầu tiên vào ngôi nhà chung.",
      num: "1",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0D47A1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>
      ),
    },
    {
      dot: "#1976D2",
      title: "Nuôi dưỡng toàn diện",
      desc: "Chúng tôi cung cấp môi trường giáo dục, chăm sóc sức khỏe và dinh dưỡng tối ưu. Mỗi cá nhân được khuyến khích phát triển tài năng thiên bẩm trong một không gian tràn ngập tình thương và sự tôn trọng.",
      num: "2",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1976D2" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 6v4l3 3" />
        </svg>
      ),
    },
    {
      dot: "#42A5F5",
      title: "Kết nối tổ ấm",
      desc: "Mục tiêu cuối cùng là giúp trẻ tìm lại hơi ấm gia đình. Chúng tôi kết nối và hỗ trợ các gia đình nhận nuôi, đảm bảo một hành trình chuyển tiếp hạnh phúc và bền vững cho tương lai của trẻ.",
      num: "3",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#42A5F5" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
      ),
    },
  ];

  const timelineItems = [
    {
      year: "2017",
      active: true,
      title: "Khởi đầu từ tâm huyết",
      desc: "Thành lập trung tâm từ sự sẻ chia và mong muốn giúp đỡ những trẻ em kém may mắn, với 10 tình nguyện viên đầu tiên.",
    },
    {
      year: "2022",
      active: false,
      title: "Mở rộng mạng lưới",
      desc: "Kết nối với hơn 50 tổ chức bảo trợ trong và ngoài tỉnh, mở rộng khả năng tiếp nhận và hỗ trợ trẻ em.",
    },
    {
      year: "2026",
      active: false,
      title: "Trung tâm thông minh",
      desc: "Ra mắt nền tảng website, số hóa toàn bộ quy trình quản lý hồ sơ và kết nối gia đình nhận nuôi.",
    },
  ];

  return (
    <div style={{ background: "#ffffff", color: "#1a2a3a" }}>
      <style>{`
        .container {
          max-width: 1120px;
          margin: 0 auto;
          padding-left: 24px;
          padding-right: 24px;
        }

        .section-title {
          font-size: clamp(24px, 3vw, 34px);
          font-weight: 800;
          line-height: 1.32;
          letter-spacing: -0.015em;
          color: #0D47A1;
          margin: 0 0 18px;
        }

        .section-title-gradient {
          font-size: clamp(24px, 3vw, 34px);
          font-weight: 800;
          line-height: 1.32;
          letter-spacing: -0.015em;
          margin: 0 0 18px;
          background: linear-gradient(90deg, #0D47A1 0%, #1976D2 55%, #42A5F5 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .section-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
          gap: 56px;
          align-items: center;
        }

        .image-wrap {
          position: relative;
          border-radius: 24px;
          overflow: visible;
          transition: transform 0.35s ease, box-shadow 0.35s ease;
        }

        .image-wrap:hover {
          transform: translateY(-6px);
        }

        .image-card {
          width: 100%;
          height: 360px;
          object-fit: cover;
          border-radius: 24px;
          display: block;
          position: relative;
          z-index: 2;
          box-shadow: 0 14px 34px rgba(13, 71, 161, 0.12);
        }

        .feat-row { display:flex; align-items:center; gap:48px; padding:40px 0; position:relative; }
        .feat-row:not(:last-child)::after { content:''; position:absolute; left:50%; bottom:0; transform:translateX(-50%); width:1px; height:1px; }
        .feat-row.reverse { flex-direction:row-reverse; text-align:right; }
        .feat-circle-wrap { flex-shrink:0; display:flex; align-items:center; justify-content:center; }
        .feat-circle { width:100px; height:100px; border-radius:50%; display:flex; align-items:center; justify-content:center; font-size:40px; font-weight:900; color:#fff; position:relative; flex-shrink:0; }
        .feat-circle-inner { position:relative; z-index:1; }
        .feat-content { flex:1; }
        .feat-title { font-size:22px; font-weight:800; color:#1a2a3a; margin:0 0 12px; letter-spacing:-0.01em; }
        .feat-desc { font-size:15.5px; line-height:1.85; color:#607080; margin:0; max-width:420px; }
        .feat-row.reverse .feat-desc { margin-left:auto; }
        .feat-icon-float { position:absolute; opacity:0.55; }

        .quote-box {
          text-align: center;
        }

        .timeline-item {
          position: relative;
        }

        .timeline-dot {
          position: absolute;
          left: -42px;
          top: 26px;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          z-index: 2;
          transition: all 0.25s ease;
        }

        .timeline-item:hover .timeline-dot {
          transform: scale(1.15);
          box-shadow: 0 0 0 6px rgba(59, 130, 246, 0.10);
        }

        .timeline-card {
          background: #ffffff;
          border: 1px solid #e5edf8;
          border-radius: 18px;
          padding: 22px 24px;
          box-shadow: 0 6px 22px rgba(13, 71, 161, 0.05);
          transition: all 0.3s ease;
        }

        .timeline-card:hover {
          transform: translateX(6px);
          border-color: #bfdcff;
          box-shadow: 0 14px 34px rgba(13, 71, 161, 0.12);
        }

        .timeline-card h3 {
          margin: 0 0 8px;
          font-size: 19px;
          font-weight: 700;
          color: #1a2a3a;
          transition: all 0.25s ease;
        }

        .timeline-card:hover h3 {
          font-size: 20px;
          color: #0D47A1;
        }

        @media (max-width: 768px) {
          .container {
            padding-left: 18px;
            padding-right: 18px;
          }

          .image-card {
            height: 280px;
          }

          .feature-title {
            font-size: 17px;
          }

          .timeline-card h3 {
            font-size: 18px;
          }
        }
      `}</style>

      {/* HERO - nền trắng */}
      <section style={{ background: "#ffffff", padding: "70px 0 76px" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 860 }}>
          <p
            style={{
              maxWidth: 700,
              margin: "0 auto",
              fontSize: 18,
              lineHeight: 1.85,
              color: "#5f6f82",
            }}
          >
            Có một nơi mà tình thương không bao giờ vơi cạn — đó chính là Trung tâm
            Bảo trợ Trẻ em Mồ côi. Chúng tôi tin rằng mỗi đứa trẻ đều xứng đáng có
            một điểm tựa, một danh tính và một tương lai tươi sáng.
          </p>
        </div>
      </section>

      {/* SECTION 1 - nền trắng */}
      <section style={{ background: "#ffffff", padding: "0 0 84px" }}>
        <div className="container section-grid">
          <div className="image-wrap">
            <div
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                right: -16,
                bottom: -16,
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, rgba(13,71,161,0.12) 0%, rgba(66,165,245,0.18) 100%)",
                zIndex: 1,
              }}
            />
            <img
              src={Anh1}
              alt="Trẻ em tại trung tâm"
              className="image-card"
            />
          </div>

          <div>
            <div
              style={{
                width: 52,
                height: 5,
                borderRadius: 999,
                marginBottom: 22,
                background: "linear-gradient(90deg, #0D47A1 0%, #42A5F5 100%)",
              }}
            />
            <h2 className="section-title">
              Từ Những Bước Chân
              <br />
              Chông Chênh…
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.9,
                color: "#5f6f82",
                margin: 0,
              }}
            >
              Hành trình của chúng tôi bắt đầu từ sự thấu cảm trước những mảnh đời
              bé thơ sớm chịu thiệt thòi, mất mát. Tại đây, mỗi trẻ em không chỉ
              được cho một nơi ở, mà được kiến tạo một gia đình thực thụ — từ những
              bữa cơm ấm nóng, những lớp học đầu đời cho đến sự chăm sóc y tế tận tâm.
            </p>
          </div>
        </div>
      </section>

      {/* SECTION 2 - nền xanh nhạt */}
      <section
        style={{
          background: "linear-gradient(180deg, #f4f9ff 0%, #eef6ff 100%)",
          padding: "84px 0",
        }}
      >
        <div className="container section-grid">
          <div>
            <div
              style={{
                width: 52,
                height: 5,
                borderRadius: 999,
                marginBottom: 22,
                background: "linear-gradient(90deg, #0D47A1 0%, #42A5F5 100%)",
              }}
            />
            <h2 className="section-title-gradient">
              …Đến Nhịp Cầu Kết Nối
              <br />
              Những Mái Ấm Hạnh Phúc
            </h2>
            <p
              style={{
                fontSize: 18,
                lineHeight: 1.9,
                color: "#5f6f82",
                margin: 0,
              }}
            >
              Hạnh phúc lớn nhất của chúng tôi không chỉ là nhìn các em lớn khôn
              dưới mái nhà chung, mà còn là được làm "nhịp cầu nhân ái" đưa các em
              đến với những gia đình nhận nuôi đầy tình thương và hy vọng.
            </p>
          </div>

          <div className="image-wrap">
            <div
              style={{
                position: "absolute",
                top: 16,
                right: 16,
                left: -16,
                bottom: -16,
                borderRadius: 24,
                background:
                  "linear-gradient(135deg, rgba(13,71,161,0.10) 0%, rgba(66,165,245,0.20) 100%)",
                zIndex: 1,
              }}
            />
            <img
              src={Anh2}
              alt="Gia đình nhận nuôi"
              className="image-card"
            />
          </div>
        </div>
      </section>

      {/* FEATURES - nền trắng */}
      <section style={{ background: "#ffffff", padding: "88px 0" }}>
        <div className="container" style={{ maxWidth: 930 }}>
          <h2
            style={{
              textAlign: "center",
              fontSize: "clamp(24px, 3vw, 34px)",
              fontWeight: 800,
              margin: "0 0 54px",
              background: "linear-gradient(90deg, #0D47A1 0%, #1976D2 55%, #42A5F5 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
            }}
          >
            Những gì chúng tôi mang lại
          </h2>

          <div style={{ display: "grid", gap: 20 }}>
            {features.map((f, i) => (
              <div key={f.num} className={`feat-row${i % 2 === 1 ? " reverse" : ""}`}>

                {/* Circle số */}
                <div className="feat-circle-wrap" style={{ position: "relative" }}>
                  {/* Icon trang trí nhỏ floating */}
                  <div className="feat-icon-float" style={{ top: i % 2 === 0 ? -14 : "auto", bottom: i % 2 === 1 ? -14 : "auto", right: i % 2 === 0 ? -10 : "auto", left: i % 2 === 1 ? -10 : "auto" }}>
                    {f.icon}
                  </div>
                  <div className="feat-circle" style={{ background: `linear-gradient(135deg, ${f.dot} 0%, ${i === 0 ? "#1976D2" : i === 1 ? "#42A5F5" : "#90CAF9"} 100%)`, boxShadow: `0 12px 32px ${f.dot}40` }}>
                    <span className="feat-circle-inner">{f.num}</span>
                  </div>
                </div>

                {/* Text */}
                <div className="feat-content">
                  <h3 className="feat-title">{f.title}</h3>
                  <p className="feat-desc">{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* QUOTE */}
      <section
        style={{
          background: "linear-gradient(180deg, #f4f9ff 0%, #eef6ff 100%)",
          padding: "90px 0 88px",
        }}
      >
        <div className="container">
          <div className="quote-box" style={{ textAlign: "center" }}>
            <p
              style={{
                fontSize: "clamp(20px, 2.6vw, 26px)",
                color: "#0D47A1",
                lineHeight: 1.8,
                fontStyle: "italic",
                fontWeight: 500,
                maxWidth: 760,
                margin: "0 auto 22px",
                textAlign: "center",
              }}
            >
              Chúng tôi không thể thay đổi quá khứ của các em, nhưng cùng với bạn,
              chúng ta có thể viết lại tương lai.
            </p>

            <p
              style={{
                fontSize: 17,
                color: "rgba(13,71,161,0.8)",
                lineHeight: 1.85,
                maxWidth: 700,
                margin: "0 auto",
                textAlign: "center",
              }}
            >
              Hãy cùng chúng tôi lan tỏa yêu thương, để mỗi trái tim nhỏ bé tại Đà
              Nẵng được sưởi ấm bởi ánh sáng của hy vọng và sự sẻ chia.
            </p>
          </div>
        </div>
      </section>

      {/* TIMELINE - nền trắng */}
      <section style={{ background: "#ffffff", padding: "88px 0" }}>
        <div className="container" style={{ maxWidth: 960 }}>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(280px,1fr))",
              gap: 32,
              marginBottom: 58,
              alignItems: "end",
            }}
          >
            <div>
              <span
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 3,
                  color: "#3b82f6",
                  textTransform: "uppercase",
                  marginBottom: 12,
                }}
              >
                Hành trình phát triển tương lai
              </span>

              <h2
                style={{
                  fontSize: "clamp(24px, 3vw, 34px)",
                  fontWeight: 800,
                  color: "#1a2a3a",
                  lineHeight: 1.35,
                  margin: 0,
                  letterSpacing: "-0.015em",
                }}
              >
                Mong muốn một thế giới nơi không đứa trẻ nào bị bỏ lại phía sau.
              </h2>
            </div>
          </div>

          <div style={{ position: "relative", paddingLeft: 42 }}>
            <div
              style={{
                position: "absolute",
                left: 7,
                top: 8,
                bottom: 8,
                width: 3,
                borderRadius: 999,
                background:
                  "linear-gradient(to bottom, #0D47A1 0%, #1976D2 50%, #42A5F5 100%)",
              }}
            />

            <div style={{ display: "grid", gap: 22 }}>
              {timelineItems.map((item) => (
                <div key={item.year} className="timeline-item">
                  <div
                    className="timeline-dot"
                    style={{
                      background: item.active
                        ? "linear-gradient(135deg, #0D47A1 0%, #42A5F5 100%)"
                        : "#ffffff",
                      border: `2px solid ${item.active ? "#0D47A1" : "#93c5fd"}`,
                      boxShadow: item.active
                        ? "0 0 0 5px rgba(13,71,161,0.12)"
                        : "none",
                    }}
                  />

                  <div
                    className="timeline-card"
                    style={{
                      background: item.active ? "#ffffff" : "#fbfdff",
                    }}
                  >
                    <span
                      style={{
                        display: "inline-block",
                        fontSize: 13,
                        fontWeight: 700,
                        color: item.active ? "#0D47A1" : "#3b82f6",
                        marginBottom: 8,
                        padding: "5px 10px",
                        borderRadius: 999,
                        background: item.active
                          ? "rgba(13,71,161,0.08)"
                          : "rgba(59,130,246,0.08)",
                      }}
                    >
                      {item.year}
                    </span>

                    <h3>{item.title}</h3>

                    <p
                      style={{
                        fontSize: 16,
                        color: "#607080",
                        lineHeight: 1.85,
                        margin: 0,
                      }}
                    >
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}