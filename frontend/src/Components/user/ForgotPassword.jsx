import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";
import Loader from "../layout/Loader";
import { forgotPassword } from "../../redux/actions/userActions";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const dispatch = useDispatch();

  const submitHandler = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await dispatch(forgotPassword(email));
      toast.success("Reset email sent — check your inbox");
      setSent(true);
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {loading ? (
        <Loader />
      ) : (
        <div className="row wrapper">
          <div className="col-10 col-lg-5">
            <form className="shadow-lg" onSubmit={submitHandler}>
              <h1 className="mb-3">Forgot Password</h1>

              {sent ? (
                <p>
                  If an account exists with that email, a reset link has
                  been sent. It's valid for 10 minutes.
                </p>
              ) : (
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    className="form-control"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              )}

              {!sent && (
                <button className="btn btn-block py3">SEND EMAIL</button>
              )}

              <Link to="/users/login" className="float-right mt-3">
                Back to login
              </Link>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default ForgotPassword;