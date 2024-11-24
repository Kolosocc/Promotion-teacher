import React, { FC } from "react";
import styles from "./Footer.module.scss";

const Footer: FC = () => (
  <footer className="flex items-center justify-center gap-8 p-8 pt-16">
    <div className={styles.icon} aria-label="Burger Menu" />
    <span>&copy; {new Date().getFullYear()}</span>
    <a
      href="https://github.com/Kolosocc"
      target="_blank"
      rel="noopener noreferrer"
      className={styles.link}
    >
      Avtor
    </a>
  </footer>
);

export default Footer;
