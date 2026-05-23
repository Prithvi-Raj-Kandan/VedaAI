import Link from 'next/link';

export default function Sidebar() {
  return (
    <aside className="w-64 h-screen bg-sidebar-bg flex flex-col border-r border-gray-200">
      {/* Logo Area */}
      <div className="p-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-veda-orange rounded flex items-center justify-center text-white font-bold">
          V
        </div>
        <span className="text-xl font-bold text-gray-900 tracking-tight">VedaAI</span>
      </div>

      {/* Primary Action */}
      <div className="px-6 mb-8">
        <Link 
          href="/assignments/create"
          className="w-full bg-gray-900 hover:bg-gray-800 text-veda-orange flex items-center justify-center gap-2 py-3 rounded-full font-medium transition-colors"
        >
          <span>+</span>
          <span>Create Assignment</span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 space-y-2">
        <NavItem icon="🏠" label="Home" href="/" />
        <NavItem icon="👥" label="My Groups" href="/groups" />
        <NavItem icon="📄" label="Assignments" href="/assignments" active badge="32" />
        <NavItem icon="✨" label="AI Teacher's Toolkit" href="/toolkit" />
        <NavItem icon="📚" label="My Library" href="/library" />
      </nav>

      {/* Bottom Area */}
      <div className="p-4 border-t border-gray-100">
        <div className="px-4 py-2 flex items-center gap-3 text-sm text-gray-600 hover:text-gray-900 cursor-pointer mb-4">
          <span>⚙️</span>
          <span>Settings</span>
        </div>
        
        <div className="p-3 bg-gray-50 rounded-xl flex items-center gap-3 border border-gray-200">
          <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0 flex items-center justify-center text-xl">
            🏫
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-semibold text-gray-900 truncate">Delhi Public School</p>
            <p className="text-xs text-gray-500 truncate">Bokaro Steel City</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function NavItem({ icon, label, href, active, badge }) {
  return (
    <Link 
      href={href}
      className={`flex items-center justify-between px-4 py-3 rounded-xl transition-colors ${
        active 
          ? 'bg-gray-100 text-gray-900 font-semibold' 
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-sm">{label}</span>
      </div>
      {badge && (
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${
          active ? 'bg-veda-orange text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {badge}
        </span>
      )}
    </Link>
  );
}
