import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { UserIcon, EnvelopeIcon, LockClosedIcon, BuildingOfficeIcon, CheckIcon } from '@heroicons/react/24/outline';
import { register, clearError } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';

const Register = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { isLoading, error, isAuthenticated } = useSelector((state) => state.auth);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    companyName: '',
    role: 'Employee',
  });

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
    if (error) {
      toast.error(error);
      dispatch(clearError());
    }
  }, [isAuthenticated, error, navigate, dispatch]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleRoleSelect = (role) => {
    setFormData({ ...formData, role });
    setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await dispatch(register(formData));
    if (register.fulfilled.match(result)) {
      toast.success('Account created! 🎉');
      navigate('/dashboard');
    }
  };

  const roles = [
    { id: 'Admin', title: 'Admin', description: 'Full access to all features' },
    { id: 'Manager', title: 'Manager / Leader', description: 'Manage team, projects, tasks' },
    { id: 'Employee', title: 'Employee', description: 'Work on assigned tasks' },
  ];

  return (
    <div className="animated-bg min-h-screen flex items-center justify-center p-3">
      <div className="relative z-10 w-full max-w-xs sm:max-w-sm">
        <div className="text-center mb-3">
          <div className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            MissionDesk
          </div>
          <p className="text-gray-400 text-[10px] tracking-wider mt-0.5">Plan. Manage. Achieve.</p>
        </div>

        <div className="glass-card rounded-xl p-5 shadow-2xl">
          {step === 1 ? (
            <>
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-white">Create account</h2>
                <p className="text-gray-400 text-[10px] mt-0.5">Fill in your details</p>
              </div>

              <form onSubmit={(e) => e.preventDefault()} className="space-y-3">
                <div>
                  <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Full Name</label>
                  <div className="relative">
                    <UserIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="input-glass-with-icon text-xs py-1.5 pl-7"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Email</label>
                  <div className="relative">
                    <EnvelopeIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="input-glass-with-icon text-xs py-1.5 pl-7"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Company</label>
                  <div className="relative">
                    <BuildingOfficeIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="input-glass-with-icon text-xs py-1.5 pl-7"
                      placeholder="Acme Inc."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-medium text-gray-300 mb-0.5">Password</label>
                  <div className="relative">
                    <LockClosedIcon className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-500" />
                    <input
                      type="password"
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      required
                      className="input-glass-with-icon text-xs py-1.5 pl-7"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setStep(2)}
                  className="btn-primary text-xs py-2"
                >
                  Continue →
                </button>
              </form>
            </>
          ) : (
            <>
              <div className="text-center mb-4">
                <h2 className="text-lg font-bold text-white">Select your role</h2>
                <p className="text-gray-400 text-[10px] mt-0.5">Choose your position</p>
              </div>

              <div className="space-y-2">
                {roles.map((role) => (
                  <button
                    key={role.id}
                    type="button"
                    onClick={() => handleRoleSelect(role.id)}
                    className={`w-full flex items-start gap-3 p-3 rounded-xl border-2 transition-all text-left ${
                      formData.role === role.id ? 'border-primary bg-primary/10' : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      formData.role === role.id ? 'bg-gradient-to-br from-primary to-secondary' : 'bg-white/10'
                    }`}>
                      <UserIcon className="w-4 h-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-sm font-semibold text-white">{role.title}</h3>
                      <p className="text-[10px] text-gray-400">{role.description}</p>
                    </div>
                    {formData.role === role.id && (
                      <CheckIcon className="w-5 h-5 text-primary flex-shrink-0" />
                    )}
                  </button>
                ))}
              </div>

              <div className="flex gap-2 mt-4">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 btn-outline text-xs py-2"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 btn-primary text-xs py-2"
                >
                  {isLoading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </>
          )}

          <p className="text-center text-[10px] text-gray-400 mt-4">
            Already have an account?{' '}
            <Link to="/login" className="text-primary hover:text-secondary font-medium">
              Login now
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;