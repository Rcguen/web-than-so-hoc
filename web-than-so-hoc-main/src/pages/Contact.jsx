import React from 'react';

function Contact() {
  return (
    <div className="contact-us section" id="contact">
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="contact-us-content">
              <div className="row">
                <div className="col-lg-4">
                  <div id="map">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.129329068307!2d106.70014237599557!3d10.801428389348983!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x317528a459c15561%3A0x68427a33b0035760!2sLandmark%2081!5e0!3m2!1sen!2s!4v1728656461947!5m2!1sen!2s"
                      width="100%" height="670px" frameBorder="0" style={{ border: 0, borderRadius: '23px' }}
                      allowFullScreen="" title="Google Maps Location"></iframe>
                  </div>
                </div>
                <div className="col-lg-8">
                  <form id="contact-form" action="" method="post">
                    <div className="row">
                      <div className="col-lg-12">
                        <div className="section-heading">
                          <h2><em>Contact Us</em> & Get In <span>Touch</span></h2>
                        </div>
                      </div>
                      <div className="col-lg-6">
                        <fieldset>
                          <input type="name" name="name" id="name" placeholder="Your Name..." autoComplete="on" required />
                        </fieldset>
                      </div>
                      <div className="col-lg-6">
                        <fieldset>
                          <input type="surname" name="surname" id="surname" placeholder="Your Surname..."
                            autoComplete="on" required />
                        </fieldset>
                      </div>
                      <div className="col-lg-6">
                        <fieldset>
                          <input type="text" name="email" id="email" pattern="[^ @]*@[^ @]*" placeholder="Your E-mail..."
                            required />
                        </fieldset>
                      </div>
                      <div className="col-lg-6">
                        <fieldset>
                          <input type="subject" name="subject" id="subject" placeholder="Subject..." autoComplete="on" />
                        </fieldset>
                      </div>
                      <div className="col-lg-12">
                        <fieldset>
                          <textarea name="message" id="message" placeholder="Your Message"></textarea>
                        </fieldset>
                      </div>
                      <div className="col-lg-12">
                        <fieldset>
                          <button type="submit" id="form-submit" className="orange-button">Send Message Now</button>
                        </fieldset>
                      </div>
                    </div>
                  </form>
                  <div className="more-info">
                    <div className="row">
                      <div className="col-lg-4">
                        <div className="info-item">
                          <i className="fa fa-phone"></i>
                           {/* ĐÃ SỬA LỖI DỨT ĐIỂM Ở ĐÂY */}
                          <h4><a href="/" onClick={(e) => e.preventDefault()}>010-020-0340</a></h4>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="info-item">
                          <i className="fa fa-envelope"></i>
                           {/* ĐÃ SỬA LỖI DỨT ĐIỂM Ở ĐÂY */}
                          <h4><a href="/" onClick={(e) => e.preventDefault()}>info@company.com</a></h4>
                          <h4><a href="/" onClick={(e) => e.preventDefault()}>hello@company.com</a></h4>
                        </div>
                      </div>
                      <div className="col-lg-4">
                        <div className="info-item">
                          <i className="fa fa-map-marker"></i>
                           {/* ĐÃ SỬA LỖI DỨT ĐIỂM Ở ĐÂY */}
                          <h4><a href="/" onClick={(e) => e.preventDefault()}>Sunny Isles Beach, FL 33160, United States</a></h4>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;