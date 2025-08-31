import React from "react";
import { Container, Row, Col } from "reactstrap";

import Loading from "../../Components/auth0components/Loading.jsx";
import { useAuth0, withAuthenticationRequired } from "@auth0/auth0-react";

export const ProfileComponent = () => {
  const { user } = useAuth0();

  return (
    <Container className="mb-5 d-flex align-items-center justify-content-center" style={{ minHeight: '80vh' }}>
      <Row className="align-items-center profile-header text-center bg-white p-5">
        <Col md={12} className="text-center">
          <h2 className="mb-3">{user.name}</h2>
          <p className="lead text-muted">{user.email}</p>
        </Col>
      </Row>
    </Container>
  );
};

export default withAuthenticationRequired(ProfileComponent, {
  onRedirecting: () => <Loading />,
});
