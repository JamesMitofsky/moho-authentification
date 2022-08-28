import { Button } from "@mui/material";
import { auth } from "../firebase";

export default function SignOut() {
  console.log(auth);

  return (
    <Button
      variant="outlined"
      fullWidth
      type="submit"
      onClick={() => auth.signOut()}
    >
      Sign Out
    </Button>
  );
}
