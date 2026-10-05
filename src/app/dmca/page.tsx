import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DMCA Policy',
  description: 'DMCA Policy and Copyright Infringement Guidelines',
};

export default function DMCAPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0a0a0a] pt-24 px-4 sm:px-8 pb-12 transition-colors duration-300">
      <div className="max-w-4xl mx-auto bg-white dark:bg-[#151515] p-8 md:p-12 rounded-3xl shadow-sm border border-gray-100 dark:border-white/5">
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 dark:text-white mb-8 uppercase tracking-wide">
          DMCA Policy
        </h1>
        
        <div className="prose prose-gray dark:prose-invert max-w-none text-gray-700 dark:text-gray-300 leading-relaxed space-y-6">
          <p>
            GameLord respects the intellectual property rights of others and expects its users to do the same. In accordance with the Digital Millennium Copyright Act of 1998, the text of which may be found on the U.S. Copyright Office website at http://www.copyright.gov/legislation/dmca.pdf, we will respond expeditiously to claims of copyright infringement.
          </p>
          
          <p>
            <strong>Disclaimer:</strong> GameLord does NOT host any game files, images, or software on our own servers. All files are hosted on third-party file-sharing services (such as Mega, Google Drive, 1Fichier, PixelDrain, etc.). We simply act as an index/search engine for links already available on the public internet.
          </p>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            How to File a Takedown Notice
          </h2>
          
          <p>
            If you are a copyright owner, authorized to act on behalf of one, or authorized to act under any exclusive right under copyright, please report alleged copyright infringements taking place on or through the Site by submitting a DMCA Notice.
          </p>
          
          <p>
            Please provide the following information in your notice:
          </p>
          
          <ul className="list-disc pl-6 space-y-2">
            <li>Identify the copyrighted work that you claim has been infringed.</li>
            <li>Identify the material or link you claim is infringing (or the subject of infringing activity) and that access to which is to be disabled, including at a minimum, if applicable, the URL of the link shown on the Site.</li>
            <li>Provide your mailing address, telephone number, and, if available, email address.</li>
            <li>Include both of the following statements in the body of the Notice:<br/>
                <em>"I hereby state that I have a good faith belief that the disputed use of the copyrighted material is not authorized by the copyright owner, its agent, or the law (e.g., as a fair use)."</em><br/>
                <em>"I hereby state that the information in this Notice is accurate and, under penalty of perjury, that I am the owner, or authorized to act on behalf of the owner, of the copyright or of an exclusive right under the copyright that is allegedly infringed."</em>
            </li>
            <li>Provide your full legal name and your electronic or physical signature.</li>
          </ul>

          <h2 className="text-xl font-bold text-gray-900 dark:text-white mt-8 mb-4">
            Contact Information
          </h2>
          
          <p>
            Please send your DMCA takedown notices to our designated abuse email address:
            <br />
            <a href="mailto:abuse@gamelord.site" className="text-blue-600 dark:text-blue-400 font-bold hover:underline mt-2 inline-block">
              abuse@gamelord.site
            </a>
          </p>
          
          <p className="text-sm text-gray-500 mt-8 italic">
            Note: We highly recommend you send your takedown notices directly to the third-party file hosters (Mega, Google Drive, etc.) as we do not host the files and removing the link from our index does not remove the file from the internet.
          </p>
        </div>
      </div>
    </div>
  );
}
