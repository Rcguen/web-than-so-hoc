import React from 'react';

function Infos() {
  return (
    <div className="infos section" id="infos">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="main-content">
              <div className="row">
                <div className="col-lg-6">
                  <div className="left-image">
                    <img src="/assets/images/left-infos.jpg" alt="" />
                  </div>
                </div>
                <div className="col-lg-6">
                  <div className="section-heading">
                    <h2>More <em>About Us</em> &amp; What <span>We Offer</span></h2>
                    <div className="line-dec"></div>
                    <p>You are free to use this template for any purpose. You are not allowed to redistribute the
                      downloadable ZIP file of Tale SEO Template on any other template website. Please contact us. Thank
                      you.</p>
                  </div>
                  <div className="skills">
                    <div className="skill-slide marketing">
                      <div className="fill"></div>
                      <h6>Marketing</h6>
                      <span>90%</span>
                    </div>
                    <div className="skill-slide digital">
                      <div className="fill"></div>
                      <h6>Ditigal Media</h6>
                      <span>80%</span>
                    </div>
                    <div className="skill-slide media">
                      <div className="fill"></div>
                      <h6>Social Media Managing</h6>
                      <span>95%</span>
                    </div>
                  </div>
                  <p className="more-info">Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed doers eiusmod tempor
                    incididunt ut labore et dolore dolor dolor sit amet, consectetur adipiscing elit, sed doers eiusmod.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Infos;