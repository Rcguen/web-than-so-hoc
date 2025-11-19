import React from 'react';
import { useNavigate } from 'react-router-dom';

function Projects() {
  const navigate = useNavigate();

  // Danh sách dự án mẫu (Cập nhật nội dung từ ảnh)
  const projectList = [
    {
      title: "Tra Cứu Thần Số Học Miễn Phí",
      desc: "Khám phá ý nghĩa của tên và ngày sinh.",
      img: "/assets/images/projects-01.jpg",
      link: "/lookup"
    },
    {
      title: "Báo Cáo Chi Tiết & Chuyên Sâu",
      desc: "Phân tích sâu sắc về vận mệnh và tính cách.",
      img: "/assets/images/projects-02.jpg",
      link: "/report"
    },
    {
      title: "Biểu Đồ Ngày Sinh & Tên",
      desc: "Giải mã năng lượng từ các con số.",
      img: "/assets/images/projects-03.jpg",
      link: "/birth-chart"
    },
    {
      title: "Dự Đoán Năm Cá Nhân",
      desc: "Nắm bắt cơ hội và thách thức trong tương lai.",
      img: "/assets/images/projects-04.jpg",
      link: "/personal-year"
    }
  ];

  return (
    <div className="projects section" id="projects">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="section-heading">
              <h2>Khám Phá <em>Sản Phẩm</em> &amp; <span>Dịch Vụ</span></h2>
              <div className="line-dec"></div>
              <p>Chúng tôi cung cấp các công cụ và báo cáo chuyên sâu giúp bạn thấu hiểu bản thân, định hướng sự nghiệp và cải thiện các mối quan hệ thông qua Thần số học.</p>
            </div>
          </div>
        </div>
      </div>
      
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="project-grid">
               <style>{`
                 .project-grid {
                   display: grid;
                   grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                   gap: 30px;
                   padding: 0 20px;
                 }
                 .project-item {
                   position: relative;
                   border-radius: 20px;
                   overflow: hidden;
                   box-shadow: 0 5px 15px rgba(0,0,0,0.08); 
                   transition: all 0.4s ease;
                   cursor: pointer;
                 }
                 
                 .project-item:hover {
                   transform: translateY(-10px);
                   box-shadow: 0 20px 40px rgba(122, 0, 255, 0.25); 
                 }
                 
                 .project-item img {
                   width: 100%;
                   display: block;
                   border-radius: 20px;
                   transition: transform 0.5s ease;
                 }
                 
                 .project-item:hover img {
                    transform: scale(1.05);
                 }

                 .project-content {
                   position: absolute;
                   bottom: 0; left: 0; width: 100%;
                   background: linear-gradient(to top, rgba(45, 0, 100, 0.95), transparent); /* Tối hơn chút để dễ đọc */
                   padding: 30px 20px;
                   color: #fff;
                   opacity: 0; 
                   transition: opacity 0.3s ease;
                   display: flex;
                   flex-direction: column;
                   justify-content: flex-end;
                 }
                 .project-item:hover .project-content {
                   opacity: 1; 
                 }
                 .project-content h4 {
                   font-size: 20px; font-weight: 700; color: #fff; margin-bottom: 5px;
                   text-shadow: 0 2px 4px rgba(0,0,0,0.5);
                 }
                 .project-content p {
                    font-size: 14px; color: #ddd; margin-bottom: 15px;
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                 }
                 .btn-project-link {
                   display: inline-block;
                   width: 40px; height: 40px; line-height: 40px;
                   background: #fff; color: #7a00ff;
                   border-radius: 50%; text-align: center;
                   transition: 0.3s; cursor: pointer;
                   align-self: flex-end; /* Đẩy nút sang phải */
                   box-shadow: 0 4px 10px rgba(0,0,0,0.2);
                 }
                 .btn-project-link:hover {
                   background: #7a00ff; color: #fff;
                 }
               `}</style>

               {projectList.map((item, index) => (
                 <div className="project-item" key={index} onClick={() => navigate(item.link)}>
                   <img src={item.img} alt={item.title} />
                   <div className="project-content">
                     <h4>{item.title}</h4>
                     <p>{item.desc}</p> {/* Thêm mô tả ngắn */}
                     <div className="btn-project-link">
                       <i className="fa fa-arrow-right"></i>
                     </div>
                   </div>
                 </div>
               ))}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;