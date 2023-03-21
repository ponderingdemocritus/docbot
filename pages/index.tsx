import { useRef, useState, useEffect, useMemo } from 'react';
import Layout from '@/components/layout';
import styles from '@/styles/Home.module.css';
import { Message } from '@/types/chat';
import { fetchEventSource } from '@microsoft/fetch-event-source';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';
import LoadingDots from '@/components/ui/LoadingDots';
import { Document } from 'langchain/document';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

export default function Home() {
  const [query, setQuery] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [sourceDocs, setSourceDocs] = useState<Document[]>([]);
  const [messageState, setMessageState] = useState<{
    messages: Message[];
    pending?: string;
    history: [string, string][];
    pendingSourceDocs?: Document[];
  }>({
    messages: [
      {
        message: 'Hi, what would you like to learn about Starknet or Cairo?',
        type: 'apiMessage',
      },
    ],
    history: [],
    pendingSourceDocs: [],
  });

  const { messages, pending, history, pendingSourceDocs } = messageState;

  console.log('messageState', messageState);

  const messageListRef = useRef<HTMLDivElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    textAreaRef.current?.focus();
  }, []);

  //handle form submission
  async function handleSubmit(e: any) {
    e.preventDefault();

    if (!query) {
      alert('Please input a question');
      return;
    }

    const question = query.trim();

    setMessageState((state) => ({
      ...state,
      messages: [
        ...state.messages,
        {
          type: 'userMessage',
          message: question,
        },
      ],
      pending: undefined,
    }));

    setLoading(true);
    setQuery('');
    setMessageState((state) => ({ ...state, pending: '' }));

    const ctrl = new AbortController();

    try {
      fetchEventSource('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question,
          history,
        }),
        signal: ctrl.signal,
        onmessage: (event) => {
          if (event.data === '[DONE]') {
            setMessageState((state) => ({
              history: [...state.history, [question, state.pending ?? '']],
              messages: [
                ...state.messages,
                {
                  type: 'apiMessage',
                  message: state.pending ?? '',
                  sourceDocs: state.pendingSourceDocs,
                },
              ],
              pending: undefined,
              pendingSourceDocs: undefined,
            }));
            setLoading(false);
            ctrl.abort();
          } else {
            const data = JSON.parse(event.data);
            if (data.sourceDocs) {
              setMessageState((state) => ({
                ...state,
                pendingSourceDocs: data.sourceDocs,
              }));
            } else {
              setMessageState((state) => ({
                ...state,
                pending: (state.pending ?? '') + data.data,
              }));
            }
          }
        },
      });
    } catch (error) {
      setLoading(false);
      console.log('error', error);
    }
  }

  //prevent empty submissions
  const handleEnter = (e: any) => {
    if (e.key === 'Enter' && query) {
      handleSubmit(e);
    } else if (e.key == 'Enter') {
      e.preventDefault();
    }
  };

  const chatMessages = useMemo(() => {
    return [
      ...messages,
      ...(pending
        ? [
            {
              type: 'apiMessage',
              message: pending,
              sourceDocs: pendingSourceDocs,
            },
          ]
        : []),
    ];
  }, [messages, pending, pendingSourceDocs]);

  const formatString = (str: string) => {
    if (str.includes('master-scroll-v3')) {
      return str
        .replace(
          '/home/os/Documents/GPT/master-scroll-v3/pages',
          'https://scroll.bibliothecadao.xyz',
        )
        .replace('.md', '');
    } else if (str.includes('starknet-docs')) {
      return 'https://docs.starknet.io/documentation';
    } else {
      return str;
    }
  };

  return (
    <>
      <Layout>
        <div className="mx-auto flex flex-col gap-4 text-white container">
          <h1 className="text-2xl font-bold leading-[1.1] tracking-tighter text-center mx-auto">
            <svg
              height="40"
              viewBox="0 0 178 41"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M0.294582 20.813C0.294582 31.719 9.13542 40.5598 20.0414 40.5598C30.9474 40.5598 39.7888 31.719 39.7888 20.813C39.7888 9.90701 30.9474 1.06616 20.0414 1.06616C9.13542 1.06616 0.294582 9.907 0.294582 20.813Z"
                fill="#0C0C4F"
                stroke="#EC796B"
                stroke-width="0.506336"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M11.2193 16.1014L11.713 14.5761C11.8133 14.2659 12.0582 14.0245 12.3695 13.9293L13.9023 13.4579C14.1145 13.3931 14.1162 13.0938 13.9057 13.0256L12.3799 12.5319C12.0702 12.4315 11.8288 12.1867 11.7331 11.8753L11.2623 10.3425C11.1975 10.1309 10.8982 10.1286 10.8299 10.3397L10.3362 11.865C10.2359 12.1746 9.991 12.416 9.67963 12.5118L8.14688 12.9826C7.93472 13.0479 7.93243 13.3467 8.14344 13.4149L9.66931 13.9086C9.97896 14.009 10.2204 14.2544 10.3161 14.5658L10.7869 16.0979C10.8517 16.3101 11.151 16.3124 11.2193 16.1014Z"
                fill="#FAFAFA"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M35.4461 15.2138C34.8142 14.5072 33.828 14.1093 32.8693 13.9462C31.9028 13.7895 30.8896 13.804 29.9355 13.9735C28.0051 14.3001 26.2514 15.0994 24.7219 16.0854C23.9276 16.5694 23.2502 17.1293 22.5484 17.6996C22.2103 17.988 21.902 18.2952 21.5809 18.5979L20.7036 19.4708C19.7504 20.4672 18.8108 21.3747 17.9017 22.127C16.989 22.8758 16.1356 23.4444 15.2947 23.8416C14.4542 24.2408 13.5549 24.4755 12.3828 24.5131C11.221 24.5541 9.84635 24.3444 8.376 23.9983C6.89774 23.6537 5.34543 23.1625 3.61075 22.7399C4.21602 24.4191 5.12749 25.903 6.2977 27.2594C7.48164 28.5923 8.96003 29.8072 10.8592 30.6062C12.7309 31.4229 15.0831 31.716 17.2825 31.2737C19.4877 30.8493 21.4229 29.8288 22.9871 28.6487C24.5553 27.4565 25.8241 26.0984 26.8937 24.6866C27.189 24.2965 27.3452 24.0782 27.5589 23.7733L28.1494 22.8985C28.5599 22.3573 28.9335 21.7412 29.3397 21.2051C30.1362 20.0822 30.9214 18.9607 31.8339 17.9274C32.2932 17.4033 32.7773 16.902 33.349 16.4203C33.6342 16.1851 33.9423 15.955 34.2835 15.7477C34.6299 15.5241 34.9957 15.3491 35.4461 15.2138Z"
                fill="#EC796B"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M35.4462 15.2134C34.7673 13.5004 33.5054 12.0585 31.8115 10.9945C30.1279 9.94223 27.7895 9.4052 25.4724 9.86299C24.3277 10.0844 23.2187 10.5106 22.2454 11.0782C21.2766 11.6436 20.4084 12.3241 19.6569 13.0543C19.2817 13.4205 18.9411 13.8026 18.6028 14.1869L17.7258 15.3049L16.3714 17.1046C14.6447 19.4202 12.7853 22.1339 9.73396 22.938C6.73838 23.7274 5.43914 23.0283 3.61086 22.7395C3.94515 23.6026 4.35925 24.4407 4.92063 25.1781C5.47155 25.9304 6.12227 26.637 6.9313 27.2426C7.34015 27.5335 7.7718 27.8206 8.25121 28.0641C8.72843 28.2994 9.24309 28.5064 9.79242 28.6623C10.8851 28.9618 12.1152 29.0667 13.3063 28.9056C14.498 28.7466 15.637 28.369 16.6326 27.8674C17.6355 27.3706 18.5092 26.7656 19.2893 26.127C20.8401 24.8392 22.0464 23.4162 23.0653 21.9778C23.5778 21.2587 24.043 20.5259 24.4733 19.793L24.9797 18.9205C25.1345 18.6654 25.2911 18.4088 25.4502 18.1698C26.0918 17.2095 26.7194 16.4395 27.4817 15.8616C28.2335 15.2687 29.2802 14.8307 30.679 14.7289C32.072 14.626 33.6801 14.8162 35.4462 15.2134Z"
                fill="#FAFAFA"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M27.91 29.4455C27.91 30.7036 28.9304 31.724 30.1885 31.724C31.4466 31.724 32.4658 30.7036 32.4658 29.4455C32.4658 28.1874 31.4466 27.167 30.1885 27.167C28.9304 27.167 27.91 28.1874 27.91 29.4455Z"
                fill="#EC796B"
              ></path>
              <path
                d="M174.837 15.2207V12.92C174.837 12.8288 174.763 12.7549 174.672 12.7549H161.563C161.471 12.7549 161.397 12.8288 161.397 12.92V15.2207H166.725V30.1045H169.509V15.2207H174.837Z"
                fill="white"
              ></path>
              <path
                d="M147.697 12.7549C147.606 12.7549 147.532 12.8288 147.532 12.92V29.9393C147.532 30.0305 147.606 30.1045 147.697 30.1045H158.729C158.82 30.1045 158.894 30.0305 158.894 29.9393V27.6631H150.316V22.2105H157.403V19.8179H150.316V15.1963H158.283V12.92C158.283 12.8288 158.209 12.7549 158.118 12.7549H147.697Z"
                fill="white"
              ></path>
              <path
                d="M141.3 30.0035L141.36 30.1045H143.498C143.59 30.1045 143.663 30.0305 143.663 29.9393V12.92C143.663 12.8288 143.59 12.7549 143.498 12.7549H140.929V24.7704C140.483 24.0602 139.965 23.2784 139.375 22.4251C138.624 21.3147 137.816 20.1882 136.951 19.0457C136.102 17.8869 135.237 16.7688 134.355 15.6914C133.489 14.5967 132.671 13.6394 131.901 12.8199L131.84 12.7549H129.827C129.736 12.7549 129.662 12.8288 129.662 12.92V29.9393C129.662 30.0305 129.736 30.1045 129.827 30.1045H132.397V17.2327C132.748 17.6476 133.122 18.1074 133.519 18.6123C134.055 19.2944 134.607 20.0256 135.176 20.8059L135.177 20.8067L135.177 20.8076C135.746 21.5711 136.315 22.3673 136.884 23.1962L136.884 23.1973L136.885 23.1984C137.471 24.0277 138.031 24.8487 138.568 25.6615L138.568 25.6623L138.569 25.6631C139.105 26.4591 139.6 27.2303 140.055 27.9769L140.055 27.9783L140.056 27.9796C140.528 28.728 140.943 29.4026 141.3 30.0035Z"
                fill="white"
              ></path>
              <path
                d="M126.3 13.1004L126.363 13.0313C126.46 12.9253 126.384 12.7549 126.241 12.7549H123.193L123.132 12.8265C122.727 13.2958 122.224 13.8472 121.623 14.4811L121.623 14.4812C121.037 15.0996 120.41 15.7505 119.743 16.4342C119.076 17.1176 118.401 17.8011 117.717 18.4845C117.17 19.0182 116.66 19.51 116.187 19.9601V12.7549H113.568C113.477 12.7549 113.403 12.8288 113.403 12.92V29.9393C113.403 30.0305 113.477 30.1045 113.568 30.1045H116.187V22.2337C116.762 22.61 117.349 23.0503 117.949 23.5551L117.95 23.5558L117.951 23.5565C118.678 24.1544 119.39 24.8091 120.085 25.521L120.087 25.5227L120.089 25.5243C120.8 26.2194 121.471 26.9549 122.101 27.7309L122.102 27.7317L122.103 27.7325C122.733 28.4923 123.29 29.2512 123.774 30.0091L123.835 30.1045H126.805C126.932 30.1045 127.012 29.9672 126.948 29.857L126.913 29.7952C126.467 29.0193 125.908 28.2048 125.235 27.3517C124.58 26.4998 123.875 25.6645 123.122 24.8459C122.369 24.0271 121.599 23.2572 120.812 22.5361C120.1 21.8831 119.419 21.3223 118.77 20.8547C119.322 20.3161 119.907 19.7376 120.526 19.1195C121.21 18.4346 121.895 17.7416 122.58 17.0404C123.281 16.3229 123.95 15.6298 124.586 14.961L124.587 14.9601L124.588 14.9592C125.224 14.2746 125.794 13.655 126.3 13.1004Z"
                fill="white"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M97.6026 12.6249C97.5114 12.6249 97.4375 12.6989 97.4375 12.79V29.9498C97.4375 30.041 97.5114 30.1149 97.6027 30.1149H99.9613V23.8059H103.407C103.795 24.27 104.173 24.7556 104.541 25.2627L104.543 25.2646L104.544 25.2665C105.147 26.0573 105.704 26.8821 106.216 27.7412L106.217 27.7421L106.217 27.7431C106.68 28.5033 107.085 29.2542 107.43 29.9957L107.486 30.115H110.277C110.397 30.115 110.476 29.9918 110.427 29.8829C110.106 29.1795 109.758 28.4907 109.372 27.8197C108.846 26.8819 108.271 25.9535 107.644 25.0344C107.286 24.5092 106.92 23.9989 106.546 23.5037C107.588 23.1854 108.411 22.6098 109.007 21.7744L109.008 21.7737C109.723 20.7626 110.077 19.5735 110.077 18.2153C110.077 17.282 109.915 16.428 109.587 15.6564C109.257 14.8735 108.761 14.2243 108.1 13.7121C107.444 13.1971 106.636 12.8695 105.683 12.7225C105.461 12.6816 105.232 12.6571 104.995 12.6488C104.765 12.6329 104.563 12.6248 104.392 12.6248C103.668 12.6248 102.944 12.6247 102.221 12.6246L102.221 12.6246C100.681 12.6245 99.142 12.6244 97.6026 12.6249ZM107.506 18.2153C107.506 18.6661 107.431 19.1097 107.28 19.5469C107.133 19.9668 106.897 20.3349 106.572 20.6529C106.264 20.9541 105.857 21.1677 105.342 21.2872C105.179 21.3243 105.003 21.3506 104.814 21.3657L104.814 21.3657L104.813 21.3657C104.628 21.3812 104.464 21.3887 104.321 21.3887H99.9613V15.0419H104.321C104.464 15.0419 104.628 15.0495 104.813 15.0649L104.818 15.0653L104.822 15.0655C105.006 15.0728 105.176 15.0984 105.334 15.1414L105.339 15.1428L105.344 15.1439C105.857 15.2555 106.263 15.4683 106.57 15.776L106.571 15.7768L106.572 15.7777C106.897 16.0952 107.132 16.467 107.28 16.8951L107.28 16.8956L107.28 16.8962C107.431 17.325 107.506 17.7644 107.506 18.2153Z"
                fill="white"
              ></path>
              <path
                fill-rule="evenodd"
                clip-rule="evenodd"
                d="M91.2452 27.814L91.2454 27.8146L91.2457 27.8153C91.4907 28.5177 91.752 29.2362 92.0295 29.971L92.08 30.1045H94.8722C94.9868 30.1045 95.0666 29.9906 95.0274 29.8829C94.4175 28.2071 93.8018 26.5335 93.1737 24.8645C92.603 23.3318 92.0404 21.8803 91.4858 20.5101C90.9474 19.1399 90.409 17.8346 89.8705 16.5943C89.3302 15.3337 88.7617 14.0856 88.1694 12.8486C88.142 12.7913 88.0841 12.7549 88.0206 12.7549H85.7935C85.73 12.7549 85.6721 12.7913 85.6446 12.8486C85.0523 14.0856 84.4839 15.3337 83.9436 16.5944C83.4052 17.8342 82.8588 19.1391 82.3043 20.5091L82.3039 20.51L82.3035 20.511C81.7654 21.8808 81.211 23.3319 80.6404 24.8644C80.0123 26.5334 79.3966 28.2071 78.7867 29.8829C78.7475 29.9906 78.8272 30.1045 78.9419 30.1045H81.6149L81.6149 30.1043H81.6672L81.7285 30.0386C82.3733 29.3463 83.094 28.6669 83.8909 28.0006L83.8917 27.9999L83.8925 27.9992C84.6925 27.3161 85.5266 26.6826 86.3948 26.0987L86.3967 26.0973L86.3987 26.096C87.2539 25.4917 88.1146 24.9495 88.9807 24.4691L88.9817 24.4686L88.9827 24.468C89.2946 24.2905 89.6017 24.1251 89.9041 23.9718L90.4883 25.6408L90.4887 25.6421L90.4887 25.6422C90.749 26.3743 91.0012 27.0982 91.2452 27.814ZM88.2414 19.5842L88.2419 19.5856L88.2425 19.587C88.4777 20.1824 88.7129 20.7877 88.9481 21.4031C88.9305 21.4108 88.9126 21.4189 88.8943 21.4272C88.0667 21.8041 87.1771 22.2914 86.2259 22.888C85.3152 23.4592 84.4118 24.0797 83.5156 24.7496L83.895 23.6658C84.3971 22.2573 84.8991 20.8972 85.4011 19.5856C85.8627 18.4027 86.3434 17.265 86.8432 16.1723C87.3283 17.2645 87.7944 18.4018 88.2414 19.5842Z"
                fill="white"
              ></path>
              <path
                d="M79.4676 15.2207V12.92C79.4676 12.8288 79.3936 12.7549 79.3024 12.7549H66.1935C66.1023 12.7549 66.0283 12.8288 66.0283 12.92V15.2207H71.3562V29.9393C71.3562 30.0305 71.4301 30.1045 71.5213 30.1045H73.9746C74.0658 30.1045 74.1397 30.0305 74.1397 29.9393V15.2207H79.4676Z"
                fill="white"
              ></path>
              <path
                d="M54 29.8935L53.9994 29.8933C52.9897 29.4629 52.15 28.8485 51.4842 28.0496L51.4832 28.0484L51.4827 28.0478C50.8235 27.2384 50.3955 26.2845 50.1967 25.1909C50.1867 25.1362 50.1993 25.0798 50.2315 25.0345C50.2636 24.9891 50.3128 24.9587 50.3677 24.95L52.5881 24.6001C52.6932 24.5835 52.7936 24.6495 52.8202 24.7526C53.09 25.801 53.6454 26.6148 54.4875 27.2046C55.3421 27.7894 56.3499 28.085 57.5196 28.085C58.2783 28.085 58.9563 27.9678 59.5565 27.737C60.1638 27.4987 60.635 27.1643 60.9791 26.7379C61.3176 26.3185 61.4884 25.822 61.4884 25.2384C61.4884 24.8761 61.4242 24.5796 61.3051 24.3412L61.302 24.3347C61.1859 24.0808 61.0238 23.8688 60.8151 23.696L60.8092 23.6909C60.5996 23.5038 60.359 23.3456 60.0862 23.2168C59.8072 23.085 59.5162 22.9764 59.2133 22.8909L59.2106 22.8901L54.7813 21.5746C54.2883 21.4267 53.8115 21.2418 53.3511 21.0198L53.3499 21.0192L53.3485 21.0185C52.881 20.7848 52.4623 20.4961 52.0933 20.1522L52.0921 20.1511L52.0915 20.1505C51.7173 19.7934 51.4206 19.3688 51.2009 18.8789L51.2004 18.8777C50.9773 18.3713 50.8691 17.7826 50.8691 17.1171C50.8691 16.0501 51.1449 15.1288 51.7056 14.3643L51.7058 14.364C52.2689 13.5991 53.028 13.0179 53.9761 12.6187C54.9228 12.2202 55.9849 12.0272 57.159 12.0354C58.3491 12.0436 59.4195 12.2571 60.3663 12.6805C61.3203 13.0954 62.1117 13.6946 62.7367 14.4777C63.3711 15.2625 63.7942 16.199 64.0092 17.282C64.02 17.3366 64.0084 17.3931 63.977 17.439C63.9455 17.4848 63.8969 17.516 63.8422 17.5256L61.5615 17.9238C61.5074 17.9333 61.4518 17.9208 61.4069 17.8891C61.3621 17.8575 61.3317 17.8093 61.3224 17.7551C61.2072 17.0794 60.9515 16.5062 60.5582 16.0297L60.556 16.0269C60.1671 15.5389 59.6793 15.165 59.0894 14.9045L59.0874 14.9036C58.4963 14.6349 57.8451 14.4955 57.1312 14.4877L57.1311 14.4877C56.4466 14.4799 55.835 14.5888 55.2928 14.8103C54.749 15.0324 54.3246 15.3389 54.0117 15.7263L54.0105 15.7278C53.7035 16.1006 53.5507 16.5287 53.5507 17.0205C53.5507 17.5089 53.6899 17.8857 53.9534 18.1705C54.2379 18.4697 54.5875 18.7112 55.0056 18.8939C55.4488 19.0759 55.8792 19.2258 56.2967 19.344L56.2976 19.3443L59.603 20.2973C59.9883 20.4039 60.4284 20.5507 60.9225 20.737C61.4397 20.9289 61.9384 21.1993 62.4184 21.5469C62.9126 21.8964 63.3184 22.3632 63.6372 22.9419C63.9648 23.5283 64.1217 24.2574 64.1217 25.1178C64.1217 25.9825 63.947 26.7597 63.5922 27.4444C63.2477 28.1247 62.7642 28.6961 62.1439 29.1571L62.1424 29.1582C61.5256 29.6082 60.8116 29.948 60.0028 30.1791C59.1939 30.4184 58.3296 30.5373 57.411 30.5373C56.1565 30.5373 55.0184 30.3241 54 29.8935Z"
                fill="white"
              ></path>
            </svg>
          </h1>
          <main
            className={
              'rounded-lg bg-gray-900/50  flex flex-col container mx-auto'
            }
          >
            <div className={'rounded-lg overflow-y-auto'}>
              <div ref={messageListRef} className={'rounded-lg'}>
                {chatMessages.map((message, index) => {
                  const bot = message.type === 'apiMessage';

                  let icon;
                  let className;
                  if (bot) {
                    icon = (
                      <Image
                        src="/starknet.png"
                        alt="AI"
                        width="40"
                        height="40"
                        className={styles.boticon}
                        priority
                      />
                    );
                    className = styles.apimessage;
                  } else {
                    icon = (
                      <Image
                        src="/usericon.png"
                        alt="Me"
                        width="40"
                        height="40"
                        className={styles.usericon}
                        priority
                      />
                    );
                    // The latest message sent by the user will be animated while waiting for a response
                    className =
                      loading && index === chatMessages.length - 1
                        ? styles.usermessagewaiting
                        : styles.usermessage;
                  }
                  return (
                    <>
                      <div
                        key={index}
                        className={`p-8  flex ${
                          bot ? 'bg-gray-900/10' : 'bg-gray-300/10'
                        } `}
                      >
                        {icon}
                        <div className={styles.markdownanswer + ' self-center'}>
                          <ReactMarkdown linkTarget="_blank">
                            {message.message}
                          </ReactMarkdown>
                        </div>
                      </div>
                      {message.sourceDocs && (
                        <div className="p-5">
                          <Accordion
                            type="single"
                            collapsible
                            className="flex-col"
                          >
                            {message.sourceDocs.map((doc, index) => (
                              <div key={index}>
                                <AccordionItem value={`item-${index}`}>
                                  <AccordionTrigger>
                                    <h3>Source {index + 1}</h3>
                                  </AccordionTrigger>
                                  <AccordionContent>
                                    <ReactMarkdown linkTarget="_blank">
                                      {doc.pageContent}
                                    </ReactMarkdown>
                                    <p className="mt-2 ">
                                      <a
                                        target={'_blank'}
                                        className="text-bold underline"
                                        href={formatString(doc.metadata.source)}
                                      >
                                        {formatString(doc.metadata.source)}
                                      </a>
                                    </p>
                                  </AccordionContent>
                                </AccordionItem>
                              </div>
                            ))}
                          </Accordion>
                        </div>
                      )}
                    </>
                  );
                })}
                {sourceDocs.length > 0 && (
                  <div className="p-5">
                    <Accordion type="single" collapsible className="flex-col">
                      {sourceDocs.map((doc, index) => (
                        <div key={index}>
                          <AccordionItem value={`item-${index}`}>
                            <AccordionTrigger>
                              <h3>Source {index + 1}</h3>
                            </AccordionTrigger>
                            <AccordionContent>
                              <ReactMarkdown linkTarget="_blank">
                                {doc.pageContent}
                              </ReactMarkdown>
                            </AccordionContent>
                          </AccordionItem>
                        </div>
                      ))}
                    </Accordion>
                  </div>
                )}
                <div>

                </div>
                {loading && <div className='p-8'><LoadingDots color="#fff" style='large' /></div> }
              </div>
            </div>
            
            <div className={'p-4 bg-gray-500/20 rounded-b-xl'}>
              <div className={styles.cloudform}>
                <form onSubmit={handleSubmit}>
                  <textarea
                    disabled={loading}
                    onKeyDown={handleEnter}
                    ref={textAreaRef}
                    autoFocus={false}
                    rows={1}
                    maxLength={512}
                    id="userInput"
                    name="userInput"
                    placeholder={
                      loading
                        ? 'Waiting for response...'
                        : 'What is a Validity Proof?'
                    }
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className={
                      ' max-w-full rounded p-4 w-full text-white bg-black/40'
                    }
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className={styles.generatebutton}
                  >
                    {loading ? (
                      <div className={styles.loadingwheel}>
                        <LoadingDots color="#000" />
                      </div>
                    ) : (
                      // Send icon SVG in input field
                      <svg
                        viewBox="0 0 20 20"
                        className={styles.svgicon}
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"></path>
                      </svg>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </main>
        </div>
        <footer className="m-auto">
          <a href="https://twitter.com/mayowaoshin">
            Powered by LangChainAI. Demo built by Mayo (Twitter: @mayowaoshin)
            forked by @lordofafew.
          </a>
        </footer>
      </Layout>
    </>
  );
}
