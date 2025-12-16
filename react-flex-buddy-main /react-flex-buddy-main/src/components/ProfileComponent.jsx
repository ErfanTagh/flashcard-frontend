import React from "react";
import { Container, Row, Col, Card, CardBody, Badge } from "reactstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEnvelope, faUser, faCalendar, faMapMarkerAlt, faGlobe, faShield, faClock } from "@fortawesome/free-solid-svg-icons";

import Loading from "../../Components/auth0components/Loading.jsx";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const ProfileComponent = () => {
  const { user } = useAuth0();

  return (
    <div className="min-vh-100 py-5" style={{backgroundColor: 'hsl(var(--secondary))'}}>
      <Container className="mb-5">
        {/* Profile Header Card */}
        <Card className="shadow-lg border-0 mb-5 overflow-hidden" style={{ 
          borderRadius: '25px',
          backgroundColor: 'hsl(var(--card))',
          color: 'hsl(var(--card-foreground))'
        }}>
          <CardBody className="p-5">
            <Row className="align-items-center">
              <Col lg={3} className="text-center mb-4 mb-lg-0">
                <div className="position-relative d-inline-block">
                  <div className="position-relative">
                     <img
                       src={user.picture}
                       alt="Profile"
                       className="rounded-circle img-fluid shadow-lg"
                       style={{ 
                         width: '180px', 
                         height: '180px', 
                         objectFit: 'cover',
                         border: '6px solid rgba(255,255,255,0.3)',
                         background: 'white'
                       }}
                     />
                     <div 
                       className="position-absolute bottom-0 end-0 bg-accent rounded-circle d-flex align-items-center justify-content-center shadow text-accent-foreground"
                       style={{ width: '40px', height: '40px', border: '4px solid white' }}
                     >
                      <FontAwesomeIcon icon={faGlobe} className="text-white" style={{ fontSize: '16px' }} />
                    </div>
                  </div>
                </div>
              </Col>
              <Col lg={9}>
                 <div className="text-center text-lg-start">
                   <h1 className="display-4 fw-bold mb-3" style={{color: 'hsl(var(--foreground))'}}>{user.name}</h1>
                   <div className="d-flex align-items-center justify-content-center justify-content-lg-start mb-4">
                     <FontAwesomeIcon icon={faEnvelope} className="me-3 fs-5" style={{opacity: 0.7, color: 'hsl(var(--muted-foreground))'}} />
                     <span className="fs-5 fw-light" style={{color: 'hsl(var(--muted-foreground))'}}>{user.email}</span>
                   </div>
                   <div className="d-flex flex-wrap gap-3 justify-content-center justify-content-lg-start">
                      <Badge 
                        className="px-4 py-2 fs-6 fw-semibold shadow-sm"
                        style={{
                          borderRadius: '50px',
                          backgroundColor: 'hsl(var(--muted))',
                          color: 'hsl(var(--muted-foreground))',
                          border: 'none'
                        }}
                      >
                        <FontAwesomeIcon icon={faUser} className="me-2" />
                        Premium User
                      </Badge>
                      <Badge 
                        className="px-4 py-2 fs-6 fw-semibold shadow-sm"
                        style={{
                          borderRadius: '50px',
                          backgroundColor: 'hsl(var(--accent))',
                          color: 'hsl(var(--accent-foreground))',
                          border: 'none'
                        }}
                      >
                       <FontAwesomeIcon icon={faShield} className="me-2" />
                       Verified
                     </Badge>
                  </div>
                </div>
              </Col>
            </Row>
          </CardBody>
        </Card>

        {/* Profile Details Cards */}
        <Row className="g-4 mb-4">
           <Col lg={4} md={6}>
              <Card className="shadow-sm border-0 h-100 hover-lift" style={{ 
                borderRadius: '20px',
                backgroundColor: 'hsl(var(--card))'
              }}>
                <CardBody className="p-4 text-center">
                  <div className="mb-4">
                    <div 
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))'
                      }}
                    >
                      <FontAwesomeIcon icon={faUser} className="fs-3" />
                    </div>
                    <h5 className="fw-bold mb-0" style={{color: 'hsl(var(--foreground))'}}>Account Details</h5>
                 </div>
                <div className="text-start">
                   <div className="d-flex justify-content-between align-items-center py-3 border-bottom" style={{borderColor: 'hsl(var(--border))'}}>
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>User ID</span>
                     <small className="text-truncate ms-2" style={{maxWidth: '120px', color: 'hsl(var(--foreground))'}}>{user.sub}</small>
                   </div>
                   <div className="d-flex justify-content-between align-items-center py-3 border-bottom" style={{borderColor: 'hsl(var(--border))'}}>
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Email Status</span>
                     <Badge 
                       className="px-3 py-1"
                       style={{
                         borderRadius: '20px',
                         backgroundColor: user.email_verified ? 'hsl(var(--accent))' : 'hsl(var(--muted))',
                         color: user.email_verified ? 'hsl(var(--accent-foreground))' : 'hsl(var(--muted-foreground))',
                         border: 'none'
                       }}
                     >
                       {user.email_verified ? "Verified" : "Pending"}
                     </Badge>
                   </div>
                   <div className="d-flex justify-content-between align-items-center py-3">
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Provider</span>
                     <Badge className="px-3 py-1" style={{
                       borderRadius: '20px',
                       backgroundColor: 'hsl(var(--muted))',
                       color: 'hsl(var(--muted-foreground))',
                       border: 'none'
                     }}>
                       {user.identities?.[0]?.provider || 'Auth0'}
                     </Badge>
                   </div>
                </div>
              </CardBody>
            </Card>
          </Col>

           <Col lg={4} md={6}>
              <Card className="shadow-sm border-0 h-100 hover-lift" style={{ 
                borderRadius: '20px',
                backgroundColor: 'hsl(var(--card))'
              }}>
                <CardBody className="p-4 text-center">
                  <div className="mb-4">
                    <div 
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        backgroundColor: 'hsl(var(--accent))',
                        color: 'hsl(var(--accent-foreground))'
                      }}
                    >
                      <FontAwesomeIcon icon={faCalendar} className="fs-3" />
                    </div>
                    <h5 className="fw-bold mb-0" style={{color: 'hsl(var(--foreground))'}}>Activity Stats</h5>
                 </div>
                 <div className="text-start">
                   <div className="d-flex justify-content-between align-items-center py-3 border-bottom" style={{borderColor: 'hsl(var(--border))'}}>
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Member Since</span>
                     <span className="fw-semibold" style={{color: 'hsl(var(--foreground))'}}>
                       {new Date(user.created_at || user.updated_at).toLocaleDateString('en-US', { 
                         month: 'short', 
                         year: 'numeric' 
                       })}
                     </span>
                   </div>
                   <div className="d-flex justify-content-between align-items-center py-3 border-bottom" style={{borderColor: 'hsl(var(--border))'}}>
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Last Active</span>
                     <span className="fw-semibold" style={{color: 'hsl(var(--foreground))'}}>
                       {new Date(user.updated_at).toLocaleDateString('en-US', { 
                         month: 'short', 
                         day: 'numeric' 
                       })}
                     </span>
                   </div>
                   <div className="d-flex justify-content-between align-items-center py-3">
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Status</span>
                     <Badge className="px-3 py-1" style={{
                       borderRadius: '20px',
                       backgroundColor: 'hsl(var(--accent))',
                       color: 'hsl(var(--accent-foreground))',
                       border: 'none'
                     }}>
                       <FontAwesomeIcon icon={faClock} className="me-1" />
                       Active
                     </Badge>
                   </div>
                 </div>
              </CardBody>
            </Card>
          </Col>

           <Col lg={4} md={12}>
              <Card className="shadow-sm border-0 h-100 hover-lift" style={{ 
                borderRadius: '20px',
                backgroundColor: 'hsl(var(--card))'
              }}>
                <CardBody className="p-4 text-center">
                  <div className="mb-4">
                    <div 
                      className="mx-auto rounded-circle d-flex align-items-center justify-content-center mb-3"
                      style={{ 
                        width: '80px', 
                        height: '80px',
                        backgroundColor: 'hsl(var(--muted))',
                        color: 'hsl(var(--muted-foreground))'
                      }}
                    >
                      <FontAwesomeIcon icon={faShield} className="fs-3" />
                    </div>
                    <h5 className="fw-bold mb-0" style={{color: 'hsl(var(--foreground))'}}>Security Info</h5>
                 </div>
                 <div className="text-start">
                   <div className="d-flex justify-content-between align-items-center py-3 border-bottom" style={{borderColor: 'hsl(var(--border))'}}>
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Auth Provider</span>
                     <Badge className="px-3 py-1" style={{
                       borderRadius: '20px',
                       backgroundColor: 'hsl(var(--muted))',
                       color: 'hsl(var(--muted-foreground))',
                       border: 'none'
                     }}>
                       Auth0
                     </Badge>
                   </div>
                   <div className="d-flex justify-content-between align-items-center py-3 border-bottom" style={{borderColor: 'hsl(var(--border))'}}>
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>Security Level</span>
                     <Badge className="px-3 py-1" style={{
                       borderRadius: '20px',
                       backgroundColor: 'hsl(var(--accent))',
                       color: 'hsl(var(--accent-foreground))',
                       border: 'none'
                     }}>
                       High
                     </Badge>
                   </div>
                   <div className="d-flex justify-content-between align-items-center py-3">
                     <span className="fw-medium" style={{color: 'hsl(var(--muted-foreground))'}}>2FA Status</span>
                     <Badge className="px-3 py-1" style={{
                       borderRadius: '20px',
                       backgroundColor: 'hsl(var(--muted))',
                       color: 'hsl(var(--muted-foreground))',
                       border: 'none'
                     }}>
                       Optional
                     </Badge>
                   </div>
                 </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

         {/* Welcome Message Card */}
        <Row>
          <Col>
             <Card 
               className="shadow-sm border-0"
               style={{ 
                 borderRadius: '20px',
                 backgroundColor: 'hsl(var(--card))',
                 color: 'hsl(var(--card-foreground))'
               }}
             >
               <CardBody className="p-5 text-center">
                 <div className="mb-4">
                   <FontAwesomeIcon icon={faMapMarkerAlt} className="fs-1 mb-3" style={{opacity: 0.7, color: 'hsl(var(--muted-foreground))'}} />
                   <h3 className="fw-bold mb-3" style={{color: 'hsl(var(--foreground))'}}>Welcome to Your Dashboard</h3>
                 </div>
                 <p className="fs-5 mb-4 fw-light" style={{opacity: 0.8, color: 'hsl(var(--muted-foreground))'}}>
                   Your account is securely protected with enterprise-grade security through Auth0. 
                   Manage your preferences, view your activity, and stay connected with our platform.
                 </p>
                 <div className="d-flex flex-wrap gap-3 justify-content-center">
                   <Badge 
                     className="px-4 py-2 fs-6 fw-semibold"
                     style={{
                       borderRadius: '50px',
                       backgroundColor: 'hsl(var(--muted))',
                       color: 'hsl(var(--muted-foreground))',
                       border: 'none'
                     }}
                   >
                     <FontAwesomeIcon icon={faShield} className="me-2" />
                     Enterprise Security
                   </Badge>
                   <Badge 
                     className="px-4 py-2 fs-6 fw-semibold"
                     style={{
                       borderRadius: '50px',
                       backgroundColor: 'hsl(var(--accent))',
                       color: 'hsl(var(--accent-foreground))',
                       border: 'none'
                     }}
                   >
                    <FontAwesomeIcon icon={faGlobe} className="me-2" />
                    Global Access
                  </Badge>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </Container>

      <style jsx>{`
        .hover-lift {
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .hover-lift:hover {
          transform: translateY(-5px);
          box-shadow: 0 10px 30px rgba(0,0,0,0.15) !important;
        }
        .min-vh-100 {
          min-height: 100vh;
        }
      `}</style>
    </div>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});