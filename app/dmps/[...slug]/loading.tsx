import Footer from "@/components/footer";
import { DmptoolLink, Link } from '@/components/link/link';
import './loading.scss';

export default function Loading() {
    return (
        <div id="Dashboard">
        <div className="t-step__landing-title">
        <div className="dmp-title">
          <p>This page describes a data management plan written for using the <DmptoolLink/>.</p>
          <div className="flex text-center">
          <div className="dots-loading">
            <div></div>
          </div>
          </div>

        </div>
      </div>
      <Footer/>
      </div>
    )
}