import { useDisconnect } from "wagmi";

export default function NavBar() {
  const { disconnect } = useDisconnect();

  return (
    <>
      <div className="navbar bg-greenLengs">
        <div className="flex-1 align-middle items-center">
          <a className="btn btn-ghost normal-case text-xl">
            <img src="/img/logo-extended.svg" className="w-26 h-5"></img>
          </a>
        </div>
        <div className="flex-none">
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar">
              <div className="w-10 rounded-full">
                <img src="https://placeimg.com/80/80/people" />
              </div>
            </label>
            <ul
              tabIndex={0}
              className="menu menu-compact dropdown-content mt-3 p-2 shadow bg-base-100 rounded-box w-52"
            >
              <li>
                <a onClick={() => disconnect()}>Disconnect</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}
