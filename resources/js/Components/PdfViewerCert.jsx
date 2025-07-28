import React from "react";
import { Document, Page, PDFViewer, StyleSheet } from "@react-pdf/renderer";
import Header from "./../Pages/Forms/PartialsCertificate/Header";
import Footer from "./../Pages/Forms//PartialsCertificate/Footer";
import BodyFirstPage from "./../Pages/Forms/PartialsCertificate/BodyFirstPage";
import BodySecondPage from "./../Pages/Forms/PartialsCertificate/BodySecondPage";
import BodyThirdPage from "./../Pages/Forms/PartialsCertificate/BodyThirdPage";
import BodyFourthPage from "./../Pages/Forms/PartialsCertificate/BodyFourthPage";
import BodyFifthPage from "./../Pages/Forms/PartialsCertificate/BodyFifthPage";

const PdfViewerCert = ({
    postulation,
    brechas,
    brechasPctCriticas,
    brechasPct,
    brechasProtCriticas,
    brechasProt,
    form,
}) => {
    return (
        <PDFViewer className="w-full h-screen mt-5">
            <Document>
                {/* Pagina 1 */}
                <Page style={styles.page}>
                    {/* Header Top */}
                    <Header />
                    {/* Body */}
                    <BodyFirstPage postulation={postulation} form={form} />
                    {/* Footer */}
                    <Footer postulation={postulation} />
                </Page>
                {/* Page 2 */}
                <Page style={styles.page}>
                    {/* Header Top */}
                    <Header />
                    {/* Body */}
                    <BodySecondPage postulation={postulation} form={form} />
                    {/* Footer */}
                    <Footer postulation={postulation} />
                </Page>
                {/* Page 3 */}
                <Page style={styles.page}>
                    {/* Header Top */}
                    <Header />
                    {/* Body */}
                    <BodyThirdPage
                        postulation={postulation}
                        brechas={brechas}
                        brechasPctCriticas={brechasPctCriticas}
                        brechasPct={brechasPct}
                        brechasProtCriticas={brechasProtCriticas}
                        brechasProt={brechasProt}
                    />
                    {/* Footer */}
                    <Footer postulation={postulation} />
                </Page>
                {/* Page 4 */}
                <Page style={styles.page}>
                    {/* Header Top */}
                    <Header />
                    {/* Body */}
                    <BodyFourthPage postulation={postulation} form={form} />
                    {/* Footer */}
                    <Footer postulation={postulation} />
                </Page>

                {/* Page 5 */}
                <Page style={styles.page}>
                    {/* Header Top */}
                    <Header />
                    {/* Body */}
                    <BodyFifthPage />
                    {/* Footer */}
                    <Footer postulation={postulation} />
                </Page>
            </Document>
        </PDFViewer>
    );
};

export default PdfViewerCert;

const styles = StyleSheet.create({
    page: {
        flexDirection: "column",
        backgroundColor: "#FFFFFFFF",
        paddingTop: 35,
        paddingHorizontal: 50,
    },
});
