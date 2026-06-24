export default interface UserSlice {
  auth0Id: string;
  email: string;
  username: string;
  picture: string;
  isAuthenticated: boolean;
  isPending: boolean;
}
