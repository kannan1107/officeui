import { Link } from 'react-router-dom'

// login user information showing on profile detail



function Home() {

    return (
        <div>
            <div className="flex min-h-screen bg-gray-100">
                {/* Left Sidebar */}
                <aside className="w-64 bg-blue-900 text-white p-5">
                    <h2 className="text-2xl font-bold mb-8">My App</h2>

                    <nav>
                        <ul className="space-y-4">
                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                Dashboard
                            </li>
                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                <Link to="/chats" className="text-white">Chats</Link>
                            </li>
                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                <Link to="/Doto" className="text-white">Create Task</Link>
                            </li>
                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                <Link to="/ListTask" className="text-white">List Tasks</Link>
                            </li>

                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                Profile
                            </li>
                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                Settings
                            </li>
                            <li className="hover:bg-blue-700 p-2 rounded cursor-pointer">
                                Logout
                            </li>
                        </ul>
                    </nav>
                </aside>

                {/* Right Content */}

            </div>
        </div>
    )
}

export default Home