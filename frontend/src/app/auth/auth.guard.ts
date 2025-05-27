import { inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";
import { Observable } from "rxjs";
import { map,take } from "rxjs/operators";
import { AuthService } from "../service/auth.service";

export function canActiate(): boolean | UrlTree | Promise<boolean | UrlTree> | Observable<boolean | UrlTree> {
  const authService: AuthService = inject(AuthService), router: Router = inject(Router);
  return authService.user.pipe(
    take(1),
    map(user => {
      const isAuth = !!user;
      if(isAuth)
        return true;
      return router.createUrlTree(['/auth']);
    })
  );
}