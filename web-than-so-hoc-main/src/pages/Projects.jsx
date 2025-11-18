import React from 'react';

function Projects() {
  return (
    <div className="projects section" id="projects">
      <div className="container">
        <div className="row">
          <div className="col-lg-6">
            <div className="section-heading">
              <h2>Discover Our <em>Work</em> &amp; <span>Projects</span></h2>
              <div className="line-dec"></div>
              <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doers eiusmod.</p>
            </div>
          </div>
        </div>
      </div>
      <div className="container-fluid">
        <div className="row">
          <div className="col-lg-12">
            <div className="owl-features owl-carousel">
              <div className="item">
                <img src="/assets/images/projects-01.jpg" alt="" />
                <div className="down-content">
                  <h4>Digital Agency HTML Templates</h4>
                  {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                  <a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-link"></i></a>
                </div>
              </div>
              <div className="item">
                <img src="/assets/images/projects-02.jpg" alt="" />
                <div className="down-content">
                  <h4>Admin Dashboard CSS Templates</h4>
                  {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                  <a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-link"></i></a>
                </div>
              </div>
              <div className="item">
                <img src="/assets/images/projects-03.jpg" alt="" />
                <div className="down-content">
                  <h4>Best Responsive Website Layouts</h4>
                  {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                  <a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-link"></i></a>
                </div>
              </div>
              <div className="item">
                <img src="/assets/images/projects-04.jpg" alt="" />
                <div className="down-content">
                  <h4>HTML CSS Layouts for your websites</h4>
                  {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                  <a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-link"></i></a>
                </div>
              </div>
              <div className="item">
                <img src="/assets/images/projects-02.jpg" alt="" />
                <div className="down-content">
                  <h4>Bootstrap 5 Themes for Free</h4>
                  {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                  <a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-link"></i></a>
                </div>
              </div>
              <div className="item">
                <img src="/assets/images/projects-03.jpg" alt="" />
                <div className="down-content">
                  <h4>Mobile Friendly Website Layouts</h4>
                  {/* ĐÃ SỬA LỖI Ở ĐÂY */}
                  <a href="/" onClick={(e) => e.preventDefault()}><i className="fa fa-link"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Projects;