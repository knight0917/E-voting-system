import { useNavigate, useLocation, Link } from 'react-router-dom';

function Sidebar({ isSidebarOpen, handleLogout }) {
    const location = useLocation();
    
    // Improved active state checking that works with sub-routes if needed
    const isActive = (path) => location.pathname === path 
        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/30' 
        : 'text-slate-400 hover:bg-slate-800 hover:text-white';

    return (
        <aside className={`fixed top-0 left-0 h-full w-[250px] bg-slate-900 border-r border-slate-800 transition-transform duration-300 z-40 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="h-16 flex items-center justify-center bg-slate-900/50 text-white text-xl font-bold tracking-wider border-b border-slate-800">
                <span className="text-indigo-500 mr-2">Voting</span>System
            </div>
            
            <div className="p-4 flex items-center border-b border-slate-800 mb-2 bg-slate-800/20">
                <div className="relative">
                    <img src="https://ui-avatars.com/api/?name=Admin&background=fff&color=000" className="w-10 h-10 rounded-full border-2 border-slate-600" alt="User" />
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-900"></div>
                </div>
                <div className="ml-3">
                    <p className="text-slate-200 font-semibold text-sm">Administrator</p>
                    <span className="text-xs text-slate-400 flex items-center mt-0.5">
                        <i className="fa fa-circle text-emerald-500 text-[8px] mr-1.5"></i> Online
                    </span>
                </div>
            </div>

            <ul className="px-3 py-2 space-y-1 overflow-y-auto h-[calc(100vh-140px)] scrollbar-thin scrollbar-thumb-slate-700">
                <li className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-4 first:mt-0">REPORTS</li>
                <li>
                    <Link to="/admin-dashboard" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/admin-dashboard')}`}>
                        <i className="fa fa-gauge-high w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Dashboard</span>
                    </Link>
                </li>
                <li>
                    <Link to="/votes" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/votes')}`}>
                        <i className="fa fa-lock w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Votes</span>
                    </Link>
                </li>
                
                <li className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">MANAGE</li>
                <li>
                    <Link to="/voters" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/voters')}`}>
                        <i className="fa fa-users w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Voters</span>
                    </Link>
                </li>
                <li>
                    <Link to="/positions" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/positions')}`}>
                        <i className="fa fa-list-ul w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Positions</span>
                    </Link>
                </li>
                <li>
                    <Link to="/candidates" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/candidates')}`}>
                        <i className="fa fa-user-tie w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Candidates</span>
                    </Link>
                </li>
                
                <li className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">SETTINGS</li>
                <li>
                    <Link to="/ballot-position" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/ballot-position')}`}>
                        <i className="fa fa-file-lines w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Ballot Position</span>
                    </Link>
                </li>
                <li>
                    <Link to="/election-title" className={`flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all group ${isActive('/election-title')}`}>
                        <i className="fa fa-font w-6 text-center text-lg mr-2 opacity-80 group-hover:opacity-100"></i> 
                        <span>Election Title</span>
                    </Link>
                </li>
                
                <li className="px-3 py-2 text-xs font-bold text-slate-500 uppercase tracking-wider mt-6">EXIT</li>
                <li>
                    <a href="#" onClick={(e) => { e.preventDefault(); handleLogout(); }} className="flex items-center px-3 py-2.5 rounded-lg text-sm font-medium transition-all text-slate-400 hover:bg-rose-900/20 hover:text-rose-500 group">
                        <i className="fa fa-power-off w-6 text-center text-lg mr-2 text-rose-500/70 group-hover:text-rose-500 transition-colors"></i> 
                        <span>Logout</span>
                    </a>
                </li>
            </ul>
        </aside>
    );
}

export default Sidebar;
