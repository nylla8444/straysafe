export default function BrowsePage() {
    return (
        <div>
            <h1 className="text-3xl font-bold mb-6">Browse</h1>
            <p className="text-gray-600 mb-4">
                Welcome to the browse section. Use the sidebar to navigate between pets and shelters.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold mb-3">Find Pets</h2>
                    <p className="text-gray-600 mb-4">
                        Browse pets available for adoption from various shelters.
                    </p>
                    <a href="/browse/pets" className="text-blue-600 hover:underline">Browse Pets →</a>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-2xl font-semibold mb-3">Find Shelters</h2>
                    <p className="text-gray-600 mb-4">
                        Discover animal shelters and rescue organizations near you.
                    </p>
                    <a href="/browse/shelters" className="text-blue-600 hover:underline">Browse Shelters →</a>
                </div>
            </div>
        </div>
    );
}