import { Footer } from "flowbite-react";

const BlogFooter = () => {
  return (
    <div className="bg-gray-100 py-1">
      <footer className="p-4 bg-white rounded-lg shadow md:flex md:items-center md:justify-between md:p-6">
        <span className="text-sm text-gray-500 sm:text-center">
          © {new Date().getFullYear()}{" "}
          <a href="https://flowbite.com/" className="hover:underline">
            CAB432
          </a>
          . All Rights Reserved.
        </span>
        <ul className="flex flex-wrap items-center mt-3 text-sm text-gray-500 sm:mt-0">
          <li>
            <a href="/" className="mr-4 hover:underline md:mr-6">
              About
            </a>
          </li>
          <li>
            <a href="#" className="mr-4 hover:underline md:mr-6">
              Privacy Policy
            </a>
          </li>
          <li>
            <a href="#" className="mr-4 hover:underline md:mr-6">
              Licensing
            </a>
          </li>
          <li>
            <a href="#" className="hover:underline">
              Contact
            </a>
          </li>
        </ul>
      </footer>
    </div>
  );
};

export default BlogFooter;
