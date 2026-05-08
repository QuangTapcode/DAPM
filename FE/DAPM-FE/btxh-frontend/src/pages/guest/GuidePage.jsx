import { useState } from "react";

const GUIDE_CONTENT = {
  adopt: {
    tab: "Hướng dẫn Nhận nuôi",
    intro:
      "Cung cấp quy trình minh bạch và đầy đủ các điều kiện pháp lý để bảo vệ quyền lợi tốt nhất cho trẻ em tại The Sanctuary.",
    conditionTitle: "01. Điều kiện nhận nuôi",
    processTitle: "02. Quy trình 4 bước",
    conditions: [
      {
        title: "Năng lực pháp lý",
        desc: "Người nhận nuôi cần có đầy đủ năng lực hành vi dân sự theo quy định của pháp luật Việt Nam.",
      },
      {
        title: "Độ tuổi phù hợp",
        desc: "Người nhận nuôi phải lớn hơn trẻ ít nhất 20 tuổi để bảo đảm sự phù hợp về vai trò chăm sóc và giám hộ.",
      },
      {
        title: "Điều kiện chăm sóc",
        desc: "Cần bảo đảm điều kiện về chỗ ở, sức khỏe, tài chính và môi trường sống ổn định để trẻ được phát triển tốt.",
      },
      {
        title: "Tư cách đạo đức",
        desc: "Không thuộc các trường hợp bị hạn chế hoặc cấm nhận nuôi con nuôi theo quy định của pháp luật.",
      },
    ],
    steps: [
      {
        title: "Nộp hồ sơ",
        desc: "Người nhận nuôi chuẩn bị hồ sơ và nộp tại cơ quan có thẩm quyền theo quy định.",
      },
      {
        title: "Thẩm định",
        desc: "Cơ quan chức năng kiểm tra hồ sơ, xác minh điều kiện thực tế và đánh giá mức độ phù hợp.",
      },
      {
        title: "Gặp mặt",
        desc: "Sắp xếp buổi tiếp xúc giữa người nhận nuôi và trẻ để hỗ trợ đánh giá sự gắn kết ban đầu.",
      },
      {
        title: "Quyết định",
        desc: "Sau khi hoàn tất thẩm định, cơ quan có thẩm quyền ban hành quyết định và hoàn thiện thủ tục pháp lý.",
      },
    ],
  },

  send: {
    tab: "Hướng dẫn Gửi trẻ",
    intro:
      "Thông tin được trình bày rõ ràng để quá trình tiếp nhận trẻ diễn ra nhanh chóng, đúng quy định và bảo đảm an toàn cho trẻ.",
    conditionTitle: "01. Điều kiện gửi trẻ",
    processTitle: "02. Quy trình 4 bước",
    conditions: [
      {
        title: "Thông tin trẻ rõ ràng",
        desc: "Cần cung cấp đầy đủ thông tin cơ bản của trẻ, tình trạng hiện tại và các thông tin liên quan đến người giám hộ.",
      },
      {
        title: "Giấy tờ cần thiết",
        desc: "Chuẩn bị các giấy tờ như giấy khai sinh, giấy tờ tùy thân của người khai báo và hồ sơ liên quan nếu có.",
      },
      {
        title: "Lý do tiếp nhận",
        desc: "Nêu rõ hoàn cảnh và lý do cần hỗ trợ để cơ quan, tổ chức có cơ sở xem xét và xử lý phù hợp.",
      },
      {
        title: "Xác minh hồ sơ",
        desc: "Thông tin cung cấp phải trung thực, có thể đối chiếu và được kiểm tra trước khi tiếp nhận chính thức.",
      },
    ],
    steps: [
      {
        title: "Tạo hồ sơ",
        desc: "Người gửi điền thông tin cần thiết và chuẩn bị hồ sơ theo hướng dẫn của hệ thống hoặc đơn vị tiếp nhận.",
      },
      {
        title: "Tiếp nhận thông tin",
        desc: "Hồ sơ được ghi nhận, phân loại và chuyển đến cán bộ phụ trách để xem xét ban đầu.",
      },
      {
        title: "Xét duyệt và xác minh",
        desc: "Cán bộ kiểm tra tính đầy đủ, hợp lệ của hồ sơ và có thể liên hệ để bổ sung thông tin khi cần.",
      },
      {
        title: "Phản hồi kết quả",
        desc: "Người gửi theo dõi trạng thái xử lý và nhận thông báo kết quả sau khi hồ sơ được xem xét hoàn tất.",
      },
    ],
  },
};

function SectionHeading({ children }) {
  return (
    <div className="guide-section-heading">
      <span className="guide-section-line" />
      <h2>{children}</h2>
    </div>
  );
}

function ConditionList({ items }) {
  return (
    <div className="guide-condition-list">
      {items.map((item, index) => (
        <div key={index} className="guide-condition-card">
          <div className="guide-condition-accent" />
          <div className="guide-condition-content">
            <h3>{item.title}</h3>
            <p>{item.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function StepList({ steps }) {
  return (
    <div className="guide-step-list">
      {steps.map((step, index) => (
        <div key={index} className="guide-step-card">
          <div className="guide-step-number">{index + 1}</div>

          <div className="guide-step-content">
            <h3>{step.title}</h3>
            <p>{step.desc}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export default function GuidePage() {
  const [tab, setTab] = useState("adopt");
  const data = GUIDE_CONTENT[tab];

  return (
    <div style={{ background: "#f4f7fb" }}>
      <style>{`
        .guide-container {
          width: 100%;
          max-width: none;
          margin: 0;
          padding-left: 100px;
          padding-right: 100px;
        }

        .guide-page {
          padding: 56px 0 88px;
        }

        .guide-intro {
          max-width: 760px;
          margin: 0 auto 28px;
          text-align: center;
          font-size: 18px;
          line-height: 1.85;
          color: #5f6f82;
        }

        .guide-tab-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 44px;
        }

        .guide-tabs {
          display: inline-flex;
          padding: 6px;
          border-radius: 18px;
          background: #dfe5ea;
          box-shadow: inset 0 1px 2px rgba(255,255,255,0.5);
        }

        .guide-tab-btn {
          min-width: 230px;
          border: none;
          background: transparent;
          border-radius: 14px;
          padding: 14px 22px;
          font-size: 16px;
          font-weight: 600;
          color: #5f6f82;
          cursor: pointer;
          transition: all 0.25s ease;
        }

        .guide-tab-btn.active {
          background: #ffffff;
          color: #0D47A1;
          box-shadow: 0 4px 14px rgba(13, 71, 161, 0.10);
        }

        .guide-content {
          display: grid;
          grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
          gap: 28px;
          align-items: start;
        }

        .guide-panel {
          min-width: 0;
        }

        .guide-section-heading {
          display: flex;
          align-items: center;
          gap: 14px;
          margin-bottom: 22px;
        }

        .guide-section-line {
          width: 58px;
          height: 4px;
          border-radius: 999px;
          background: linear-gradient(90deg, #0D47A1 0%, #42A5F5 100%);
          flex-shrink: 0;
        }

        .guide-section-heading h2 {
          margin: 0;
          font-size: clamp(26px, 2.3vw, 32px);
          font-weight: 800;
          color: #2c3540;
          letter-spacing: -0.02em;
        }

        .guide-condition-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .guide-condition-card {
          background: rgba(255,255,255,0.96);
          border: 1px solid #e6edf5;
          border-radius: 24px;
          min-height: 150px;
          display: flex;
          overflow: hidden;
          box-shadow: 0 10px 28px rgba(13, 71, 161, 0.04);
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }

        .guide-condition-card:hover {
          transform: translateY(-4px);
          border-color: #cfe0f6;
          box-shadow: 0 18px 38px rgba(13, 71, 161, 0.08);
        }

        .guide-condition-accent {
          width: 4px;
          background: linear-gradient(180deg, #1e88e5 0%, #64b5f6 100%);
          flex-shrink: 0;
        }

        .guide-condition-content {
          padding: 28px 28px;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }

        .guide-condition-content h3 {
          margin: 0 0 12px;
          font-size: 19px;
          font-weight: 800;
          color: #2f3944;
          letter-spacing: -0.01em;
        }

        .guide-condition-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
          color: #64748b;
        }

        .guide-step-list {
          display: grid;
          grid-template-columns: 1fr;
          gap: 20px;
        }

        .guide-step-card {
          background: rgba(255,255,255,0.96);
          border: 1px solid #e6edf5;
          border-radius: 24px;
          min-height: 150px;
          padding: 26px 28px;
          display: grid;
          grid-template-columns: 64px minmax(0, 1fr);
          gap: 20px;
          align-items: center;
          box-shadow: 0 10px 28px rgba(13, 71, 161, 0.04);
          transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
        }

        .guide-step-card:hover {
          transform: translateY(-3px);
          border-color: #cfe0f6;
          box-shadow: 0 18px 38px rgba(13, 71, 161, 0.08);
        }

        .guide-step-number {
          width: 56px;
          height: 56px;
          border-radius: 18px;
          background: linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%);
          color: #ffffff;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 26px;
          font-weight: 800;
          box-shadow: 0 12px 24px rgba(59, 130, 246, 0.25);
        }

        .guide-step-content h3 {
          margin: 0 0 10px;
          font-size: 22px;
          font-weight: 800;
          color: #0D47A1;
          letter-spacing: -0.02em;
        }

        .guide-step-content p {
          margin: 0;
          font-size: 16px;
          line-height: 1.75;
          color: #64748b;
        }

        @media (max-width: 1024px) {
          .guide-content {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 768px) {
          .guide-container {
            padding-left: 18px;
            padding-right: 18px;
          }

          .guide-page {
            padding: 42px 0 72px;
          }

          .guide-intro {
            font-size: 16px;
            margin-bottom: 22px;
          }

          .guide-tabs {
            width: 100%;
          }

          .guide-tab-wrap {
            margin-bottom: 34px;
          }

          .guide-tab-btn {
            min-width: 0;
            width: 100%;
            font-size: 14px;
            padding: 13px 14px;
          }

          .guide-section-heading h2 {
            font-size: 24px;
          }

          .guide-condition-card,
          .guide-step-card {
            min-height: auto;
          }

          .guide-condition-content {
            padding: 24px 20px;
          }

          .guide-condition-content h3 {
            font-size: 18px;
          }

          .guide-condition-content p,
          .guide-step-content p {
            font-size: 15px;
          }

          .guide-step-card {
            grid-template-columns: 52px minmax(0, 1fr);
            gap: 14px;
            padding: 22px 18px;
          }

          .guide-step-number {
            width: 46px;
            height: 46px;
            border-radius: 14px;
            font-size: 22px;
          }

          .guide-step-content h3 {
            font-size: 20px;
          }
        }
      `}</style>

      <section className="guide-page">
        <div className="guide-container">
          <p className="guide-intro">{data.intro}</p>

          <div className="guide-tab-wrap">
            <div className="guide-tabs">
              <button
                className={`guide-tab-btn ${tab === "adopt" ? "active" : ""}`}
                onClick={() => setTab("adopt")}
              >
                Hướng dẫn Nhận nuôi
              </button>

              <button
                className={`guide-tab-btn ${tab === "send" ? "active" : ""}`}
                onClick={() => setTab("send")}
              >
                Hướng dẫn Gửi trẻ
              </button>
            </div>
          </div>

          <div className="guide-content">
            <section className="guide-panel">
              <SectionHeading>{data.conditionTitle}</SectionHeading>
              <ConditionList items={data.conditions} />
            </section>

            <section className="guide-panel">
              <SectionHeading>{data.processTitle}</SectionHeading>
              <StepList steps={data.steps} />
            </section>
          </div>
        </div>
      </section>
    </div>
  );
}