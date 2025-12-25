export default function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-auto">
      <div className="container mx-auto px-4 py-6">
        <div className="text-center text-gray-600 text-sm">
          <p>&copy; {new Date().getFullYear()} SOWONEE Gallery. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
