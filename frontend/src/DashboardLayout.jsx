import { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import Sidebar from './Sidebar';

function DashboardLayout({ children, title, subTitle = "Control Panel", loading = false }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
    const navigate = useNavigate();
    const location = useLocation();

    // Responsive Sidebar Logic
    useEffect(() => {
        const handleResize = () => setIsSidebarOpen(window.innerWidth > 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const toggleSidebar = (e) => {
        if (e) e.preventDefault();
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('admin_token');
        navigate('/admin-login');
    };

    // Generate breadcrumbs from path
    const pathSegments = location.pathname.split('/').filter(x => x);

    return (
        <div className="min-h-screen bg-slate-950 text-slate-100 font-sans">
            {/* Sidebar */}
            <Sidebar isSidebarOpen={isSidebarOpen} handleLogout={handleLogout} />

            {/* Main Content */}
            <main className={`transition-all duration-300 ease-in-out min-h-screen flex flex-col ${isSidebarOpen ? 'md:ml-[250px]' : ''}`}>
                <header className="h-16 bg-slate-900 border-b border-slate-800 flex justify-between items-center px-6 sticky top-0 z-50 shadow-md">
                    <a href="#" className="text-slate-400 hover:text-white transition-colors p-2 text-xl block sidebar-toggle" onClick={toggleSidebar}>
                        <i className="fa fa-bars"></i>
                    </a>
                    <div className="flex items-center space-x-4">
                        <div className="flex items-center cursor-pointer text-sm font-medium hover:text-indigo-400 transition-colors">
                            <img src="https://ui-avatars.com/api/?name=Admin&background=fff&color=000" className="w-8 h-8 rounded-full mr-3 border-2 border-slate-700" alt="User" />
                            <span className="hidden sm:block">System Administrator</span>
                        </div>
                    </div>
                </header>

                <div className="flex-1 p-6 bg-slate-950">
                    <section className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">{title}</h1>
                            {subTitle && <p className="text-slate-400 text-sm mt-1">{subTitle}</p>}
                        </div>
                        <nav className="hidden sm:block">
                            <ol className="flex space-x-2 text-sm text-slate-500 bg-slate-900/50 px-3 py-1.5 rounded-lg border border-slate-800">
                                <li><Link to="/admin-dashboard" className="hover:text-indigo-400 transition-colors"><i className="fa fa-home"></i> Home</Link></li>
                                {pathSegments.map((segment, index) => {
                                    const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
                                    const isLast = index === pathSegments.length - 1;
                                    return (
                                        <li key={segment} className="flex items-center space-x-2">
                                            <span className="text-slate-700">/</span>
                                            {isLast ? (
                                                <span className="text-indigo-400 font-medium capitalize">{segment.replace('-', ' ')}</span>
                                            ) : (
                                                <Link to={path} className="hover:text-indigo-400 transition-colors capitalize">{segment.replace('-', ' ')}</Link>
                                            )}
                                        </li>
                                    );
                                })}
                            </ol>
                        </nav>
                    </section>

                    {loading ? (
                        <div className="flex justify-center items-center h-64 text-slate-500">
                            <i className="fa fa-spinner fa-spin text-3xl mb-2"></i>
                            <span className="ml-3 text-lg">Loading...</span>
                        </div>
                    ) : (
                        <div className="animate-fade-in text-base">
                            {children}
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}

export default DashboardLayout;
